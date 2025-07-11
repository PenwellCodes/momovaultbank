const express = require("express");
const router = express.Router();

// Placeholder route
router.get("/get-acc-balance-currency", (req, res) => {
  res.status(200).json({ message: "GetAccBalanceCurrency route placeholder" });
});

module.exports = router;
