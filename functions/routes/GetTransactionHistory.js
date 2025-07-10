const express = require('express');
const router = express.Router();
const { getAllTransactions } = require('../services/Transfer/TransactionsHistory');


router.get("/transaction-history", authenticateToken, getAllTransactions)


module.exports = router;