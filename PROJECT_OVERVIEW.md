# MoMo Vault - Mobile Money Savings Platform

## 🎯 Project Overview

**MoMo Vault** (also branded as "Mo Pocket") is a comprehensive mobile money-based savings platform built for Eswatini (Swaziland). The system allows users to make fixed-term deposits using Mobile Money (MoMo) payments and earn returns while providing flexible withdrawal options with penalty structures.

## 🏗️ System Architecture

### Backend (Firebase Functions + Express.js)
- **Runtime**: Node.js 20 with Firebase Functions
- **Framework**: Express.js with CORS support
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication system
- **Payment Integration**: MTN Mobile Money API (Collection & Disbursement)

### Frontend (React + Vite)
- **Framework**: React with Vite build system
- **Styling**: Tailwind CSS with custom MoMo branding
- **State Management**: React hooks and local storage
- **Icons**: React Icons (Font Awesome)
- **Routing**: React Router for navigation

## 🔧 Core Features

### 1. User Management System
- **Registration & Login**: Secure user authentication with JWT tokens
- **User Profiles**: Store user information including phone numbers for MoMo integration
- **Role-based Access**: Support for different user roles (user, admin)

### 2. Mobile Money Integration
- **Collection API**: Accept payments from users via MTN Mobile Money
- **Disbursement API**: Send money back to users during withdrawals
- **Token Management**: Automatic token generation and refresh for MoMo APIs
- **Phone Validation**: Eswatini-specific phone number validation (268 country code)

### 3. Vault System (Core Savings Feature)
- **Fixed Deposits**: Users can lock money for specific periods (1-30+ days)
- **Individual Deposit Tracking**: Each deposit is treated as a separate contract
- **Flexible Lock Periods**: Support for various lock durations with different penalty structures
- **Automatic Maturity Tracking**: System tracks when deposits mature

### 4. Advanced Withdrawal System
- **Individual Deposit Selection**: Users can choose specific deposits to withdraw from
- **Tiered Penalty Structure**: 
  - **Flat 10% penalty** for ALL early withdrawals (regardless of lock period)
  - **E5 flat fee** charged per deposit withdrawal
  - **No penalties** after maturity period
- **Immediate Withdrawal**: No 24-hour waiting period restrictions
- **Batch Processing**: Withdraw from multiple deposits in a single transaction

### 5. Transaction Management
- **Comprehensive Tracking**: All deposits, withdrawals, and penalties are recorded
- **Transaction History**: Users can view their complete transaction history
- **Revenue Tracking**: System tracks all fees and penalties for business analytics
- **Audit Trail**: Complete audit trail for all financial operations

### 6. Admin Dashboard
- **User Management**: View and manage all registered users
- **Transaction Monitoring**: Monitor all system transactions
- **Vault Overview**: View all user vaults and locked deposits
- **Revenue Analytics**: Comprehensive revenue breakdown including:
  - Total system revenue
  - Flat fees collected
  - Early withdrawal penalties
  - User statistics and system metrics

## 💰 Business Model

### Revenue Streams
1. **Flat Fees**: E5 charged on every deposit withdrawal
2. **Early Withdrawal Penalties**: 10% of deposit amount for early withdrawals
3. **Volume-based Revenue**: More deposits = more potential fee revenue

### Fee Structure
- **Deposit**: Free (encourages user adoption)
- **Withdrawal Fee**: E5 per deposit (regardless of amount)
- **Early Withdrawal Penalty**: Flat 10% of deposit amount
- **Mature Withdrawal**: Only E5 flat fee (no penalty)

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication
- **User Isolation**: Users can only access their own data
- **Phone Number Validation**: Eswatini-specific validation
- **API Key Management**: Secure MoMo API credential handling

### Data Protection
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Comprehensive input validation and sanitization
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Environment Variables**: Sensitive data stored in environment variables

## 📊 Database Schema

### User Model
```javascript
{
  userName: String,
  userEmail: String,
  password: String (hashed),
  phoneNumber: String,
  role: String (default: "user")
}
```

### Vault Model
```javascript
{
  userId: ObjectId,
  balance: Number,
  lockedDeposits: [DepositSchema],
  createdAt: Date
}
```

### LockedDeposit Model
```javascript
{
  userId: ObjectId,
  amount: Number,
  lockPeriodInDays: Number,
  startDate: Date,
  endDate: Date,
  status: String, // "locked", "unlocked", "withdrawn-early"
  penaltyApplied: Boolean
}
```

### Transaction Model
```javascript
{
  userId: ObjectId,
  type: String, // "deposit", "withdrawal", "penalty"
  amount: Number,
  lockPeriodInDays: Number,
  penaltyFee: Number,
  momoTransactionId: String,
  relatedLockedDepositIndex: Mixed, // Links to specific deposit
  createdAt: Date
}
```

## 🌐 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/check-auth` - Verify authentication status

### Mobile Money Operations
- `POST /momo/token` - Generate collection token
- `POST /momo/money-collect` - Process MoMo payment
- `POST /momo-api/generate-token` - Generate disbursement token
- `GET /momo-api/account-owner-balance` - Check MoMo account balance

### Vault Operations
- `POST /api/deposit` - Create new deposit
- `POST /api/withdraw` - Withdraw from specific deposits
- `GET /api/withdrawable-deposits` - Get deposits available for withdrawal
- `GET /api/vault-info` - Get user's complete vault information

### Admin Operations
- `GET /api/admin/users` - Get all users
- `GET /api/admin/transaction` - Get all transactions
- `GET /api/admin/vault` - Get all vaults
- `GET /api/admin/revenue` - Get system revenue analytics

## 🎨 User Interface

### Dashboard Features
- **Multi-tab Interface**: Dashboard, Deposits, Transactions, Withdrawals
- **Real-time Statistics**: Balance, available funds, active deposits, penalties
- **Visual Indicators**: Color-coded transaction types and deposit statuses
- **Responsive Design**: Mobile-first design with desktop optimization

### Key UI Components
- **Deposit Flow**: Integrated MoMo payment process
- **Withdrawal Interface**: Select specific deposits with fee calculations
- **Transaction History**: Comprehensive transaction listing with filters
- **Status Indicators**: Visual feedback for deposit maturity and withdrawal eligibility

## 🚀 Deployment & Infrastructure

### Firebase Integration
- **Firebase Functions**: Serverless backend deployment
- **Environment Configuration**: Secure environment variable management
- **Automatic Scaling**: Firebase handles traffic scaling automatically

### Development Setup
- **Local Development**: Firebase emulators for local testing
- **Hot Reload**: Vite development server with fast refresh
- **Environment Management**: Separate development and production configurations

## 📈 Business Intelligence

### Analytics & Reporting
- **Revenue Tracking**: Real-time revenue calculations
- **User Metrics**: User growth and engagement statistics
- **Transaction Analytics**: Deposit and withdrawal patterns
- **Penalty Analysis**: Early withdrawal behavior insights

### Key Performance Indicators (KPIs)
- Total system revenue
- Average deposit amount and duration
- Early withdrawal rate
- User retention and growth
- System profit margins

## 🔄 System Workflow

### Deposit Process
1. User initiates deposit with amount and lock period
2. System generates MoMo collection token
3. User completes MoMo payment
4. System creates locked deposit record
5. Vault balance updated
6. Transaction recorded

### Withdrawal Process
1. User selects specific deposits to withdraw
2. System calculates fees and penalties
3. Disbursement token generated
4. MoMo transfer initiated
5. Deposit statuses updated
6. Multiple transactions recorded (withdrawal + fees)

## 🛡️ Risk Management

### Financial Controls
- **Individual Deposit Tracking**: Each deposit treated separately
- **Penalty Enforcement**: Automatic penalty calculation and application
- **Balance Validation**: Ensures sufficient funds before operations
- **Transaction Integrity**: Complete audit trail for all operations

### Technical Safeguards
- **Input Validation**: Comprehensive validation on all inputs
- **Error Handling**: Graceful error handling and user feedback
- **Token Management**: Automatic token refresh and error recovery
- **Data Consistency**: MongoDB transactions for critical operations

## 🎯 Target Market

### Primary Users
- **Individual Savers**: People looking to save money with mobile money
- **Eswatini Residents**: Specifically designed for Eswatini mobile money users
- **Mobile-First Users**: Users comfortable with mobile money transactions

### Use Cases
- **Emergency Savings**: Short-term savings with quick access
- **Goal-based Saving**: Longer-term savings for specific goals
- **Impulse Control**: Lock money away to prevent spending
- **Earning Returns**: Generate income through penalty fees from other users

## 🔮 Future Enhancements

### Potential Features
- **Interest Payments**: Reward long-term savers with interest
- **Savings Goals**: Allow users to set and track savings targets
- **Social Features**: Group savings and challenges
- **Investment Options**: Expand beyond simple savings to investments
- **Multi-currency Support**: Support for other currencies beyond EUR
- **Advanced Analytics**: More detailed user insights and recommendations

---

## 📋 Technical Summary

**MoMo Vault** is a sophisticated fintech platform that bridges traditional savings concepts with modern mobile money technology. It provides a secure, user-friendly way for Eswatini residents to save money using their mobile phones while generating revenue through a fair and transparent fee structure.

The system's strength lies in its individual deposit tracking, flexible withdrawal options, and comprehensive admin tools, making it suitable for both users seeking savings solutions and administrators managing a financial service platform.