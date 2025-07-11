const express = require("express");
const router = express.Router();

// Placeholder route
router.get("/get-transfer-status", (req, res) => {
  res.status(200).json({ message: "GetTrannsferstatus route placeholder" });
});

module.exports = router;
