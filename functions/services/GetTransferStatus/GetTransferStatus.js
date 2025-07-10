const { momoBaseUrl } = require('../../middlewares/momoConfig.js');
const momoTokenManager = require('../../middlewares/TokenManager.js');
const referenceIdManager = require('../../middlewares/referenceIdManager.js');

exports.GetTransferStatus = async function (req, res) {

    // Retrieve the referenceId
    const referenceId = referenceIdManager.getReferenceId();

    if (!referenceId) {
        res.status(400).json({ message: 'ReferenceId not available.' });
        return;
    }

    // Check if token is available
    const momoToken = momoTokenManager.getMomoToken();

    if (!momoToken) {
        res.status(401).json({ message: 'Token not available. Please obtain a token first.' });
        return;
    }

    try {
        const response = await fetch(`${momoBaseUrl}/v1_0/transfer/${referenceId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${momoToken}`,
                'X-Target-Environment': process.env.TARGET_ENVIRONMENT,
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
                'Ocp-Apim-Subscription-Key': process.env.SUBSCRIPTION_KEY,
            },
        });

        const responseData = {
            responseStatus: response.status,
            responseBody: await response.text(),
        };

        res.json(responseData);

        console.log(response.status);
        console.log(responseData);

    } catch (error) {
        console.error(error);
        const errorMessage = 'Internal server error. Please try again.';
        res.status(500).json({ error: errorMessage });
    }

}