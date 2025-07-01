const express = require('express');
const router = express.Router();
const { collect } = require('../services/requesttopay.js');
router.post("/money-collect",  collect)

module.exports = router;