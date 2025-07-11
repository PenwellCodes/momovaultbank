const { momoDisbursementBaseUrl } = require('../../middlewares/momoConfig'); // ✅ Correct import
const momoTokenManager = require('../../middlewares/TokenManager.js');
const referenceIdManager = require('../../middlewares/DisbursementReferenceIdManager.js');
const axios = require('axios');

exports.GetTransferStatus = async function (req, res) {
  // Retrieve the referenceId
  const referenceId = referenceIdManager.getReferenceId();

  if (!referenceId) {
    return res.status(400).json({ message: 'ReferenceId not available.' });
  }

  // Check if token is available
  const momoToken = momoTokenManager.getMomoDisbursementToken(); // ✅ Correct token function

  if (!momoToken) {
    return res.status(401).json({ message: 'Token not available. Please obtain a token first.' });
  }

  try {
    const response = await axios.get(`${momoDisbursementBaseUrl}/v1_0/transfer/${referenceId}`, {
      headers: {
        'Authorization': `Bearer ${momoToken}`,
        'X-Target-Environment': process.env.TARGET_ENVIRONMENT,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Ocp-Apim-Subscription-Key': process.env.DISBURSEMENT_SUBSCRIPTION_KEY, // ✅ Make sure this key exists in .env
      },
    });

    res.json({
      responseStatus: response.status,
      responseBody: response.data,
    });

    console.log("Status:", response.status);
    console.log("Body:", response.data);

  } catch (error) {
    console.error("Transfer status error:", error.response?.data || error.message);
    const status = error.response?.status || 500;
    const message = error.response?.data || 'Internal server error. Please try again.';
    res.status(status).json({ error: message });
  }
};
