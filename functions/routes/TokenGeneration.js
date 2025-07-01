const express = require('express');
const router = express.Router();
const { AccessTokenGeneration } = require('../services/accesstoken.js');

router.post("/token", AccessTokenGeneration)

module.exports = router; 