const express = require('express');
const router = express.Router();
const { transfer } = require('../services/Transfer/TransferMoney');
const { deleteTransaction } = require('../services/Transfer/SaveTransaction');


router.post("/money-transfer", authenticateToken, transfer)
router.delete("/delete-transaction/:id", authenticateToken, deleteTransaction)
module.exports = router;