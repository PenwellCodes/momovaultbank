const momoTokenManager = require('../../middlewares/momoConfig');
const { momoBaseUrl } = require('../../middlewares/TokenManager');

exports.BalanceCurrency = async function (req, res) {
    // Check if token is available
    const momoToken = momoTokenManager.getMomoToken();

    if (!momoToken) {
        res.status(401).json({ message: 'Token not available. Please obtain a token first.' });
        return;
    }

    try {
        const response = await fetch(`${momoBaseUrl}/v1_0/account/balance`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${momoToken}`,
                'X-Target-Environment': process.env.TARGET_ENVIRONMENT,
                'Cache-Control': 'no-cache',
                'Ocp-Apim-Subscription-Key': process.env.SUBSCRIPTION_KEY,
            },
        });

        // Check if the response status is 200
        if (response.status === 200) {
            res.status(200).json({
                responseStatus: response.status,
                balance: "0.00" // Hardcoded balance value
            });
        } else {
            // For any other status, return the actual response data
            const responseData = {
                responseStatus: response.status,
                responseBody: await response.text(),
            };
            res.json(responseData);
        }

        console.log('Response status:', response.status);

    } catch (error) {
        console.error(error);
        const errorMessage = 'Internal server error. Please try again.';
        res.status(500).json({ error: errorMessage });
    }
}
