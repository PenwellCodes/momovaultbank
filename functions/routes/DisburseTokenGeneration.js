const express = require('express');
const router = express.Router();
const { AccessTokenGeneration } = require('../services/Token/DisbursementsService');

router.post("/generate-token", AccessTokenGeneration)

module.exports = router;