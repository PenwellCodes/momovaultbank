# Individual Deposit Withdrawal System - Implementation Guide

## 🎯 SYSTEM OVERVIEW

The MoMo Vault system has been updated to treat each `LockedDeposit` as an individual fixed deposit contract. Users can now select specific deposits to withdraw from, with each deposit having its own fees and penalties.

## 🔧 NEW ENDPOINTS

### 1. Individual Deposit Withdrawal
```
POST /api/withdraw
Authorization: Bearer <token>
Content-Type: application/json

{
  "phoneNumber": "76123456",
  "depositIds": ["depositId1", "depositId2", "depositId3"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Individual deposit withdrawals processed successfully",
  "data": {
    "totalWithdrawn": 285,
    "totalFees": 15,
    "totalPenalties": 20,
    "referenceId": "uuid-here",
    "processedDeposits": [
      {
        "depositId": "depositId1",
        "originalAmount": 100,
        "penalty": 10,
        "flatFee": 5,
        "netAmount": 85,
        "isEarlyWithdrawal": true,
        "lockPeriodInDays": 2
      }
    ],
    "depositsProcessed": 3
  }
}
```

### 2. Get Withdrawable Deposits
```
GET /api/withdrawable-deposits
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "depositId": "depositId1",
      "amount": 100,
      "lockPeriodInDays": 2,
      "depositDate": "2024-01-01T00:00:00.000Z",
      "canWithdraw": true,
      "isEarlyWithdrawal": true,
      "penalty": 10,
      "flatFee": 5,
      "netAmount": 85,
      "hoursUntilEligible": 0,
      "hoursUntilMaturity": 12
    }
  ]
}
```

## 📋 KEY CHANGES

### ⚡ Individual Processing
- **Each deposit is processed independently**
- **Each deposit gets its own E5 flat fee**
- **Penalties are calculated per deposit**
- **24-hour wait period applies to each deposit individually**

### 💰 Fee Structure (Per Deposit)
1. **Flat Fee**: E5 charged on EACH deposit withdrawal
2. **Early Withdrawal Penalty**: 10% of individual deposit amount (only for 1-3 day lock periods)
3. **Net Amount**: `Original Amount - Penalty - Flat Fee`

### 🔒 Validation Rules
- User must select specific deposit IDs to withdraw
- Each deposit must be owned by the authenticated user
- Each deposit must be in "locked" status
- Each deposit must have passed the 24-hour minimum wait period
- Net amount after fees/penalties must be positive

### 📊 Transaction Recording
Each withdrawal creates multiple transaction records:
1. **Withdrawal transaction** - for the net amount received
2. **Penalty transaction** - for the E5 flat fee
3. **Penalty transaction** - for early withdrawal penalty (if applicable)

All transactions are linked to the specific deposit via `relatedLockedDepositIndex`.

## 🧪 TESTING SCENARIOS

### Test Individual Deposit Withdrawal
```bash
# 1. Get withdrawable deposits
GET /api/withdrawable-deposits

# 2. Select specific deposits to withdraw
POST /api/withdraw
{
  "phoneNumber": "76123456",
  "depositIds": ["depositId1", "depositId2"]
}
```

### Test Multiple Deposit Types
1. **Create deposits with different lock periods**:
   - Deposit 1: E100 for 1 day (early withdrawal penalty applies)
   - Deposit 2: E200 for 7 days (no penalty after maturity)
   - Deposit 3: E150 for 30 days (no penalty for long-term locks)

2. **Test withdrawal scenarios**:
   - Withdraw from 1-day deposit early (penalty + fee)
   - Withdraw from 7-day deposit after maturity (fee only)
   - Withdraw from multiple deposits simultaneously

## 🚨 ERROR SCENARIOS

1. **Invalid Deposit IDs**: Non-existent or already withdrawn deposits
2. **Unauthorized Access**: Trying to withdraw another user's deposits
3. **Too Early**: Attempting withdrawal before 24-hour minimum
4. **Insufficient Net Amount**: When fees/penalties exceed deposit amount
5. **Mixed Ownership**: Including deposits from different users

## 📈 BENEFITS

### For Users
- **Transparency**: Clear breakdown of fees per deposit
- **Flexibility**: Choose which specific deposits to withdraw
- **Fairness**: Each deposit treated according to its own terms

### For System
- **Accurate Accounting**: Precise tracking of fees and penalties
- **Audit Trail**: Clear transaction history per deposit
- **Scalability**: System handles any number of individual deposits

## 🔄 MIGRATION NOTES

- **Backward Compatibility**: Old transaction records with numeric `relatedLockedDepositIndex` still work
- **New Records**: Use ObjectId for `relatedLockedDepositIndex` to reference specific deposits
- **Vault Balance**: Still maintained for overall account tracking

## 🛡️ SECURITY FEATURES

- **User Isolation**: Users can only access their own deposits
- **Deposit Validation**: Each deposit validated individually
- **Authentication Required**: All operations require valid JWT token
- **Phone Validation**: Eswatini mobile number format enforced

Your MoMo Vault system now provides true individual deposit management! 🎉