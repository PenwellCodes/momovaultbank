const express = require("express");
const Vault = require("../../models/Vault");
const Transaction = require("../../models/Transaction");
const router = express.Router();

// 🔒 Deposit
router.post("/deposit", async (req, res) => {
  const { userId, amount, lockPeriodInDays } = req.body;

  try {
    let vault = await Vault.findOne({ userId });

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + lockPeriodInDays);

    const lockedDeposit = {
      amount,
      lockPeriodInDays,
      startDate: new Date(),
      endDate,
    };

    if (!vault) {
      vault = new Vault({
        userId,
        balance: 0,
        lockedDeposits: [lockedDeposit],
      });
    } else {
      vault.lockedDeposits.push(lockedDeposit);
    }

    await vault.save();

    await Transaction.create({
      userId,
      type: "deposit",
      amount,
      lockPeriodInDays,
    });

    res.status(200).json({ success: true, message: "Deposit successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 💸 Withdraw
router.post("/withdraw", async (req, res) => {
  const { userId } = req.body;

  try {
    const vault = await Vault.findOne({ userId });
    if (!vault) return res.status(404).json({ success: false, message: "Vault not found" });

    const now = new Date();
    let totalWithdrawn = 0;

    const updatedDeposits = vault.lockedDeposits.map((deposit) => {
      if (deposit.status === "locked") {
        if (now >= new Date(deposit.endDate)) {
          deposit.status = "unlocked";
          totalWithdrawn += deposit.amount;
        } else {
          deposit.status = "withdrawn-early";
          deposit.penaltyApplied = true;
          const penalty = deposit.amount * 0.1;
          totalWithdrawn += deposit.amount - penalty;

          Transaction.create({
            userId,
            type: "penalty",
            amount: penalty,
          });
        }

        Transaction.create({
          userId,
          type: "withdrawal",
          amount: deposit.amount,
        });
      }
      return deposit;
    });

    vault.balance -= totalWithdrawn;
    vault.lockedDeposits = updatedDeposits;

    await vault.save();

    res.status(200).json({
      success: true,
      message: "Withdrawal processed",
      data: { totalWithdrawn },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
