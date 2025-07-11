const express = require("express");
const router = express.Router();
const Vault = require("../../models/Vault");
const LockedDeposit = require("../../models/LockedDeposit");
const Transaction = require("../../models/Transaction");
const authenticateMiddleware = require("../../middlewares/auth-middleware");

// Get user's vault information
router.get("/vault-info", authenticateMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get vault information
    const vault = await Vault.findOne({ userId });
    
    // Get locked deposits
    const lockedDeposits = await LockedDeposit.find({ userId }).sort({ createdAt: -1 });
    
    // Get recent transactions
    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate available withdrawal amount
    const now = new Date();
    let availableForWithdrawal = 0;
    let totalPenalties = 0;
    
    const withdrawableDeposits = lockedDeposits.filter(deposit => {
      if (deposit.status !== "locked") return false;
      
      const depositTime = new Date(deposit.createdAt);
      const hoursSinceDeposit = (now - depositTime) / (1000 * 60 * 60);
      
      // Must wait at least 24 hours
      if (hoursSinceDeposit < 24) return false;
      
      const lockPeriodInHours = deposit.lockPeriodInDays * 24;
      const isEarlyWithdrawal = hoursSinceDeposit < lockPeriodInHours;
      
      // Calculate penalty for early withdrawal (1-3 day locks only)
      if (isEarlyWithdrawal && deposit.lockPeriodInDays >= 1 && deposit.lockPeriodInDays <= 3) {
        totalPenalties += deposit.amount * 0.1; // 10% penalty
      }
      
      availableForWithdrawal += deposit.amount;
      return true;
    });

    // Subtract penalties and flat fee from available amount
    const netAvailable = Math.max(0, availableForWithdrawal - totalPenalties - 5); // E5 flat fee

    res.status(200).json({
      success: true,
      data: {
        vault: vault || { balance: 0, lockedDeposits: [] },
        lockedDeposits,
        recentTransactions: transactions,
        withdrawalInfo: {
          totalLocked: availableForWithdrawal,
          penalties: totalPenalties,
          flatFee: 5,
          netAvailable: netAvailable,
          withdrawableDeposits: withdrawableDeposits.length
        }
      }
    });

  } catch (error) {
    console.error("Vault info error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch vault information",
      error: error.message
    });
  }
});

// Get withdrawal eligibility for specific deposits
router.get("/withdrawal-eligibility", authenticateMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const lockedDeposits = await LockedDeposit.find({ 
      userId, 
      status: "locked" 
    }).sort({ createdAt: 1 });

    const now = new Date();
    const eligibilityInfo = lockedDeposits.map(deposit => {
      const depositTime = new Date(deposit.createdAt);
      const hoursSinceDeposit = (now - depositTime) / (1000 * 60 * 60);
      const lockPeriodInHours = deposit.lockPeriodInDays * 24;
      
      const canWithdraw = hoursSinceDeposit >= 24;
      const isEarlyWithdrawal = hoursSinceDeposit < lockPeriodInHours;
      const hoursUntilEligible = Math.max(0, 24 - hoursSinceDeposit);
      const hoursUntilMaturity = Math.max(0, lockPeriodInHours - hoursSinceDeposit);
      
      let penalty = 0;
      if (canWithdraw && isEarlyWithdrawal && deposit.lockPeriodInDays >= 1 && deposit.lockPeriodInDays <= 3) {
        penalty = deposit.amount * 0.1;
      }

      return {
        depositId: deposit._id,
        amount: deposit.amount,
        lockPeriodInDays: deposit.lockPeriodInDays,
        depositDate: deposit.createdAt,
        canWithdraw,
        isEarlyWithdrawal,
        penalty,
        hoursUntilEligible: Math.ceil(hoursUntilEligible),
        hoursUntilMaturity: Math.ceil(hoursUntilMaturity),
        netAmount: deposit.amount - penalty
      };
    });

    res.status(200).json({
      success: true,
      data: eligibilityInfo
    });

  } catch (error) {
    console.error("Withdrawal eligibility error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch withdrawal eligibility",
      error: error.message
    });
  }
});

module.exports = router;