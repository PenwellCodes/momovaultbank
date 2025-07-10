const { momoDisbursementBaseUrl } = require('../../../Middleware/Momo-middlewares/momoConfig.js'); // ✅ FIXED
const momoTokenManager = require('../../../Middleware/Momo-middlewares/TokenManager.js');
const referenceIdManager = require('../../../Middleware/Momo-middlewares/referenceIdManager.js');
const transactionController = require('../Transfer/SaveTransaction.js');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

async function ensureMomoToken() {
  let token = momoTokenManager.getMomoDisbursementToken(); // ✅ FIXED
  if (!token) {
    const apiUserId = process.env.Disbursement_API_USER;
    const apiKey = process.env.Disbursement_API_KEY;
    const credentials = `${apiUserId}:${apiKey}`;
    const encodedCredentials = Buffer.from(credentials).toString('base64');

    try {
      const response = await axios.post(`${momoDisbursementBaseUrl}/token/`, null, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Ocp-Apim-Subscription-Key': process.env.Disbursement_SUBSCRIPTION_KEY,
          'Authorization': `Basic ${encodedCredentials}`,
        },
      });

      token = response.data.access_token;
      momoTokenManager.setMomoDisbursementToken(token); // ✅ FIXED
    } catch (error) {
      console.error("Token generation error:", error.response?.data || error.message);
      throw new Error('Failed to generate MoMo token');
    }
  }
  return token;
}

async function checkTransactionStatus(referenceId, momoToken) {
  try {
    const response = await axios.get(`${momoDisbursementBaseUrl}/v1_0/transfer/${referenceId}`, {
      headers: {
        'Authorization': `Bearer ${momoToken}`,
        'X-Target-Environment': process.env.TARGET_ENVIRONMENT,
        'Ocp-Apim-Subscription-Key': process.env.Disbursement_SUBSCRIPTION_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Transaction status fetch failed:", error.response?.data || error.message);
    return { error: "Failed to fetch transaction status" };
  }
}

exports.transfer = async function (req, res) {
  try {
    const momoToken = await ensureMomoToken();
    if (!momoToken) return res.status(401).json({ error: "No MoMo access token available" });

    const referenceId = uuidv4();
    referenceIdManager.setReferenceId(referenceId);

    const { amount, phoneNumber, payerMessage, employeeName, image } = req.body;

    let formattedPhone = phoneNumber.startsWith("268") ? phoneNumber : "268" + phoneNumber;

    const body = {
      amount: String(amount),
      currency: 'EUR',
      externalId: uuidv4().replace(/-/g, '').slice(0, 24),
      payee: {
        partyIdType: "MSISDN",
        partyId: formattedPhone
      },
      payerMessage,
      payeeNote: "Salary paid",
    };

    console.log("> Sending to:", `${momoDisbursementBaseUrl}/v1_0/transfer/${referenceId}`);
    console.log("> Body:", body);

    const response = await axios.post(`${momoDisbursementBaseUrl}/v1_0/transfer/${referenceId}`, body, {
      headers: {
        'Authorization': `Bearer ${momoToken}`,
        'X-Reference-Id': referenceId,
        'X-Target-Environment': process.env.TARGET_ENVIRONMENT,
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': process.env.Disbursement_SUBSCRIPTION_KEY,
      },
      validateStatus: () => true,
    });

    if (response.status === 202) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      const transactionStatus = await checkTransactionStatus(referenceId, momoToken);

      const result = {
        message: "Transfer initiated successfully.",
        referenceId,
        financialTransactionId: transactionStatus.financialTransactionId,
        status: transactionStatus.status,
      };

      console.log("> Transfer Result:", result);
      res.json(result);

      const transactionData = {
        date: new Date(),
        employeeName,
        amountPaid: amount,
        paymentStatus: transactionStatus.status || 'pending',
        phoneNumber,
        image,
        userId: req.user?._id || null,
      };

      await transactionController.saveTransaction(transactionData, req.user?._id || null);
    } else {
      console.error("Transfer failed:", response.data);
      res.status(response.status).json({
        error: 'Transfer failed',
        details: response.data,
      });
    }
  } catch (err) {
    const status = err.response?.status || 500;
    const data = err.response?.data || err.message;
    console.error("MoMo Error:", data);

    res.status(status).json({
      error: 'Transfer failed',
      details: typeof data === 'object' ? JSON.stringify(data, null, 2) : data,
    });
  }
};
