const express = require("express");
const router = express.Router();
const Vault = require("../../models/Vault");
const LockedDeposit = require("../../models/LockedDeposit");
const Transaction = require("../../models/Transaction");
const momoTokenManager = require("../../middlewares/TokenManager");
const { momoDisbursementBaseUrl } = require("../../middlewares/momoConfig");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
const authenticateMiddleware = require("../../middlewares/auth-middleware");
const { validateAndFormatPhone } = require("../../utils/phoneValidator");

// Ensure disbursement token is available
async function ensureDisbursementToken() {
  let token = momoTokenManager.getMomoDisbursementToken();
  
  if (!token) {
    const apiUserId = process.env.DISBURSEMENT_API_USER;
    const apiKey = process.env.DISBURSEMENT_API_KEY;
    const credentials = `${apiUserId}:${apiKey}`;
    const encodedCredentials = Buffer.from(credentials).toString('base64');

    try {
      const response = await axios.post(`${momoDisbursementBaseUrl}/token/`, null, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Ocp-Apim-Subscription-Key': process.env.DISBURSEMENT_SUBSCRIPTION_KEY,
          'Authorization': `Basic ${encodedCredentials}`,
        },
      });
      token = response.data.access_token;
      momoTokenManager.setMomoDisbursementToken(token);
    } catch (error) {
      console.error("Disbursement Token Generation Error:", error.response?.data || error.message);
      throw new Error('Failed to generate disbursement token');
    }
  }
  
  return token;
}

// 💸 Withdraw with proper validation and penalties
router.post("/withdraw", authenticateMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const { phoneNumber, amount } = req.body;

    // Validate input
    if (!phoneNumber || !amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Valid phone number and amount are required" 
      });
    }

    // Validate and format phone number
    const phoneValidation = validateAndFormatPhone(phoneNumber);
    if (!phoneValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: `Invalid phone number: ${phoneValidation.error}`
      });
    }
    const formattedPhone = phoneValidation.formatted;

    // Get user's vault
    const vault = await Vault.findOne({ userId });
    if (!vault) {
      return res.status(404).json({ 
        success: false, 
        message: "Vault not found" 
      });
    }

    // Get all locked deposits for this user
    const lockedDeposits = await LockedDeposit.find({ 
      userId, 
      status: "locked" 
    }).sort({ createdAt: 1 }); // Oldest first

    if (lockedDeposits.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No locked deposits available for withdrawal" 
      });
    }

    const now = new Date();
    let totalAvailable = 0;
    let totalPenalties = 0;
    const withdrawableDeposits = [];

    // Check each deposit for availability and calculate penalties
    for (const deposit of lockedDeposits) {
      const depositTime = new Date(deposit.createdAt);
      const hoursSinceDeposit = (now - depositTime) / (1000 * 60 * 60);
      
      // Must wait at least 24 hours before any withdrawal
      if (hoursSinceDeposit < 24) {
        continue;
      }

      const lockPeriodInHours = deposit.lockPeriodInDays * 24;
      const isEarlyWithdrawal = hoursSinceDeposit < lockPeriodInHours;
      
      let penalty = 0;
      
      // Calculate penalty for early withdrawal (1-3 day locks only)
      if (isEarlyWithdrawal && deposit.lockPeriodInDays >= 1 && deposit.lockPeriodInDays <= 3) {
        penalty = deposit.amount * 0.1; // 10% penalty
      }

      withdrawableDeposits.push({
        deposit,
        penalty,
        isEarly: isEarlyWithdrawal
      });

      totalAvailable += deposit.amount;
      totalPenalties += penalty;
    }

    if (withdrawableDeposits.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No deposits available for withdrawal yet. Please wait at least 24 hours after deposit." 
      });
    }

    // Check if user has enough available funds
    const netAvailable = totalAvailable - totalPenalties;
    const flatFee = 5; // E5 flat fee for all withdrawals
    const totalRequired = parseFloat(amount) + flatFee;

    if (netAvailable < totalRequired) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient funds. Available: E${netAvailable.toFixed(2)}, Required: E${totalRequired.toFixed(2)} (including E5 fee)` 
      });
    }

    // Generate disbursement token
    const disbursementToken = await ensureDisbursementToken();

    // Prepare disbursement request
    const referenceId = uuidv4();
    const disbursementBody = {
      amount: String(amount),
      currency: 'EUR',
      externalId: uuidv4().replace(/-/g, '').slice(0, 24),
      payee: {
        partyIdType: "MSISDN",
        partyId: formattedPhone,
      },
      payerMessage: "Withdrawal from MoMoVault",
      payeeNote: "Vault funds withdrawal",
    };

    // Execute disbursement
    const disbursementResponse = await axios.post(
      `${momoDisbursementBaseUrl}/v1_0/transfer`,
      disbursementBody,
      {
        headers: {
          'Authorization': `Bearer ${disbursementToken}`,
          'X-Reference-Id': referenceId,
          'X-Target-Environment': process.env.TARGET_ENVIRONMENT,
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key': process.env.DISBURSEMENT_SUBSCRIPTION_KEY,
        },
        validateStatus: () => true
      }
    );

    if (disbursementResponse.status !== 202) {
      return res.status(disbursementResponse.status).json({
        success: false,
        message: 'Disbursement failed',
        details: disbursementResponse.data
      });
    }

    // Update deposits and vault
    let amountToDeduct = parseFloat(amount) + flatFee + totalPenalties;
    
    for (const { deposit } of withdrawableDeposits) {
      if (amountToDeduct <= 0) break;
      
      deposit.status = "unlocked";
      await deposit.save();
    }

    // Update vault balance
    vault.balance -= amountToDeduct;
    await vault.save();

    // Record withdrawal transaction
    await Transaction.create({
      userId,
      type: "withdrawal",
      amount: parseFloat(amount),
      penaltyFee: totalPenalties,
      momoTransactionId: referenceId,
      createdAt: new Date()
    });

    // Record flat fee transaction
    await Transaction.create({
      userId,
      type: "penalty",
      amount: flatFee,
      penaltyFee: flatFee,
      momoTransactionId: referenceId,
      createdAt: new Date()
    });

    // Record penalty transactions if any
    if (totalPenalties > 0) {
      await Transaction.create({
        userId,
        type: "penalty",
        amount: totalPenalties,
        penaltyFee: totalPenalties,
        momoTransactionId: referenceId,
        createdAt: new Date()
      });
    }

    res.status(200).json({
      success: true,
      message: "Withdrawal processed successfully",
      data: {
        withdrawnAmount: parseFloat(amount),
        flatFee: flatFee,
        earlyWithdrawalPenalty: totalPenalties,
        totalDeducted: amountToDeduct,
        referenceId: referenceId,
        remainingBalance: vault.balance
      }
    });

  } catch (error) {
    console.error("Withdrawal error:", error);
    res.status(500).json({
      success: false,
      message: "Withdrawal processing failed",
      error: error.message
    });
  }
});

module.exports = router;