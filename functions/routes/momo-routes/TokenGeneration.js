const express = require("express");
const router = express.Router();

// Placeholder route
router.get("/token-generation", (req, res) => {
  res.status(200).json({ message: "TokenGeneration route placeholder" });
});

module.exports = router;
