const { momoCollectionBaseUrl } = require('../../middlewares/momoConfig'); // ✅ Correct base URL
const momoTokenManager = require('../../middlewares/TokenManager'); // ✅ Token manager
const axios = require('axios');

exports.BalanceCurrency = async function (req, res) {
  const momoToken = momoTokenManager.getMomoCollectionToken(); // ✅ Correct token method

  if (!momoToken) {
    return res.status(401).json({ message: 'Token not available. Please obtain a token first.' });
  }

  try {
    const response = await axios.get(`${momoCollectionBaseUrl}/v1_0/account/balance`, {
      headers: {
        'Authorization': `Bearer ${momoToken}`,
        'X-Target-Environment': process.env.TARGET_ENVIRONMENT,
        'Cache-Control': 'no-cache',
        'Ocp-Apim-Subscription-Key': process.env.Disbursement_SUBSCRIPTION_KEY,
      },
    });

    // Return actual balance from MoMo API
    return res.status(200).json({
      responseStatus: response.status,
      balance: response.data, // MoMo returns { availableBalance, currency }
    });

  } catch (error) {
    console.error("Balance fetch failed:", error.response?.data || error.message);
    const status = error.response?.status || 500;
    const message = error.response?.data || 'Internal server error. Please try again.';
    return res.status(status).json({ error: message });
  }
};
