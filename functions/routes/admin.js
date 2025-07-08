const express = require("express");
const router = express.Router(); // ✅ FIXED
const User = require("../models/User");
const Vault = require("../models/Vault");
const Transaction = require("../models/Transaction");

// 🧠 Fetch all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json({ users });
  } catch (err) {
    console.error("Fetch users error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// 💰 Fetch all transactions
router.get("/transaction", async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.json({ transaction: transactions });
  } catch (err) {
    console.error("Fetch transactions error:", err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// 🏦 Fetch all vaults
router.get("/vault", async (req, res) => {
  try {
    const vaults = await Vault.find();
    res.json({ vault: vaults });
  } catch (err) {
    console.error("Fetch vaults error:", err); // 👈 ADD THIS LINE
    res.status(500).json({ error: "Failed to fetch vaults" });
  }
});
module.exports = router;
