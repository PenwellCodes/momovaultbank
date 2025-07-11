const express = require("express");
const router = express.Router();

// Placeholder route
router.get("/get-transaction-history", (req, res) => {
  res.status(200).json({ message: "GetTransactionHistory route placeholder" });
});

module.exports = router;
