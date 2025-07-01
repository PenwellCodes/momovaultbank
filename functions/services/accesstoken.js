const { momoBaseUrl } = require('../middlewares/momoConfig.js');
const momoTokenManager = require('../middlewares/TokenManager.js'); // Use TokenManager.js

// getting access token
exports.AccessTokenGeneration = async function (req, res) {
 try {

 const apiUserId = process.env.API_USER;
 const apiKey = process.env.API_KEY;

 // Concatenate API user ID and API key with a colon
 const credentials = `${apiUserId}:${apiKey}`;


 const encodedCredentials = Buffer.from(credentials).toString('base64');

 const response = await fetch(`${momoBaseUrl}/token/`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 'Cache-Control': 'no-cache',
 'Ocp-Apim-Subscription-Key': process.env.SUBSCRIPTION_KEY,
 'Authorization': `Basic ${encodedCredentials}`,
 },
 });

 const data = await response.json();

 if (response.ok) {
   // Store the token using TokenManager
   if (data.access_token) {
     momoTokenManager.setMomoToken(data.access_token);
   }
 }

 if (res) {  // If called as middleware
 if (response.ok) {
 res.json({ message: 'Token retrieved successfully', data });
 } else {
 res.status(response.status).json({ message: 'Failed to retrieve token' });
 }
 } else {    // If called programmatically
 if (response.ok) {
 return { data };
 } else {
 throw new Error('Failed to retrieve token');
 }
 }
 } catch (error) {
 if (res) {  // If called as middleware
 console.error(error);
 res.status(500).json({ error: 'Internal server error. Please try again.' });
 } else {    // If called programmatically
 throw error;
 }
 }
};