const { momoBaseUrl } = require('../middlewares/momoConfig.js');
const momoTokenManager = require('../middlewares/TokenManager.js');
const referenceIdManager = require('../middlewares/referenceManager.js');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

// Import models
const Vault = require('../models/Vault');
const LockedDeposit = require('../models/LockedDeposit');
const Transaction = require('../models/Transaction');

async function ensureMomoToken() {
  let token = momoTokenManager.getMomoToken();
  console.log('Current token:', token);

  if (!token) {
    const apiUserId = process.env.API_USER;
    const apiKey = process.env.API_KEY;
    const credentials = `${apiUserId}:${apiKey}`;
    const encodedCredentials = Buffer.from(credentials).toString('base64');

    try {
      const response = await axios.post(`${momoBaseUrl}/momo/generate-token`, null, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Ocp-Apim-Subscription-Key': process.env.SUBSCRIPTION_KEY,
          'Authorization': `Basic ${encodedCredentials}`,
        },
      });
      token = response.data.access_token;
      momoTokenManager.setMomoToken(token);
    } catch (error) {
      console.error("Token Generation Error:", error.response?.data || error.message);
      throw new Error('Failed to generate Momo token');
    }
  }

  return token;
}

async function checkTransactionStatus(referenceId, momoToken) {
  try {
    const response = await axios.get(`${momoBaseUrl}/v1_0/requesttopay/${referenceId}`, {
      headers: {
        'Authorization': `Bearer ${momoToken}`,
        'X-Target-Environment': process.env.TARGET_ENVIRONMENT,
        'Ocp-Apim-Subscription-Key': process.env.SUBSCRIPTION_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Transaction status fetch failed:", error.response?.data || error.message);
    return { error: "Failed to fetch transaction status" };
  }
}

exports.collect = async function (req, res) {
  try {
    const momoToken = await ensureMomoToken();
    if (!momoToken) {
      return res.status(401).json({ error: 'No MoMo access token available.' });
    }

    const referenceId = uuidv4();
    referenceIdManager.setReferenceId(referenceId);

    const { amount, phoneNumber, orderId, userId, lockPeriodInDays } = req.body;

    // Ensure MSISDN format
    let formattedPhone = phoneNumber;
    if (!formattedPhone.startsWith("268")) {
      formattedPhone = "268" + formattedPhone;
    }

    const body = {
      amount: String(amount),
      currency: 'EUR', // Or 'ZAR' depending on sandbox
      externalId: orderId || uuidv4().replace(/-/g, '').slice(0, 24),
      payer: {
        partyIdType: "MSISDN",
        partyId: formattedPhone,
      },
      payerMessage: "Payment for services rendered",
      payeeNote: "Money collected",
    };

    console.log(">  Sending request to:", `${momoBaseUrl}/v1_0/requesttopay/${referenceId}`);
    console.log(">  Request Body:", body);

    const response = await axios.post(`${momoBaseUrl}/v1_0/requesttopay`, body, {
      headers: {
        'Authorization': `Bearer ${momoToken}`,
        'X-Reference-Id': referenceId,
        'X-Target-Environment': process.env.TARGET_ENVIRONMENT,
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': process.env.SUBSCRIPTION_KEY
      },
      validateStatus: () => true
    });

    if (response.status === 202) {
      // Wait before checking status
      await new Promise(resolve => setTimeout(resolve, 5000));
      const transactionStatus = await checkTransactionStatus(referenceId, momoToken);

      // Save to Vault
      let vault = await Vault.findOne({ userId });
      if (!vault) {
        vault = new Vault({ userId, balance: 0 });
      }

      vault.balance += parseFloat(amount);
      await vault.save();

      // Save locked deposit
      await LockedDeposit.create({
        userId,
        amount: parseFloat(amount),
        lockPeriodInDays: parseInt(lockPeriodInDays),
        status: "locked",
      });

      // Save transaction
      await Transaction.create({
        userId,
        type: "deposit",
        amount: parseFloat(amount),
        status: transactionStatus.status || "PENDING",
      });

      return res.json({
        message: "Transaction processed and recorded.",
        referenceId,
        financialTransactionId: transactionStatus.financialTransactionId,
        status: transactionStatus.status,
      });
    } else {
      const statusCode = response.status;
      const errorDetails = response.data || 'No response body';

      console.error("Request to pay failed:");
      console.log("Status Code:", statusCode);
      console.log("Headers:", response.headers);
      console.log("Error Body:", errorDetails);

      return res.status(statusCode).json({
        error: 'Request to pay failed',
        details: typeof errorDetails === 'object'
          ? JSON.stringify(errorDetails, null, 2)
          : errorDetails
      });
    }
  } catch (err) {
    const status = err.response?.status || 500;
    const errorDetails = err.response?.data || err.message;

    console.error("MoMo API Error:", errorDetails);

    res.status(status).json({
      error: 'Transaction failed',
      details: typeof errorDetails === 'object'
        ? JSON.stringify(errorDetails, null, 2)
        : errorDetails
    });
  }
};
