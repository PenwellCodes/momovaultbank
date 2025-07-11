const express = require("express");
const router = express.Router();

// Placeholder route
router.post("/transfer", (req, res) => {
  res.status(200).json({ message: "Transfer route placeholder" });
});

module.exports = router;
