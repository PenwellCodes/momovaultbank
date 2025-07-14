@@ .. @@
           Mo Pocket
          </div>
          <nav className="space-y-2">
            {[
              { id: 'dashboard', icon: FaTachometerAlt, label: 'Dashboard' },
              { id: 'deposits', icon: FaLock, label: 'My Deposits' },
              { id: 'transactions', icon: FaExchangeAlt, label: 'Transactions' },
              { id: 'withdrawals', icon: FaArrowDown, label: 'Withdrawals' },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-2 p-3 rounded-lg transition-colors ${
                  activeTab === id
                    ? 'bg-white/20 text-momoYellow font-semibold'
                    : 'hover:bg-white/10 hover:text-momoYellow'
                }`}
              >
                <Icon />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 space-y-6">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Welcome back, {user?.userName || 'User'}!
              </h1>
              <p className="text-gray-600">Manage your vault and track your savings</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={goToDeposit}
                className="bg-momoYellow text-momoBlue font-semibold px-4 py-2 rounded-lg hover:brightness-110 flex items-center gap-2"
              >
                <FaArrowUp />
                Deposit
              </button>
              <button
                onClick={goToWithdraw}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <FaArrowDown />
                Withdraw
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <>
              {/* Stats Cards */}
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white shadow rounded-lg p-6 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm text-gray-500">Vault Balance</h3>
                      <p className="text-2xl font-bold text-blue-600">
                        E{stats?.totalBalance?.toFixed(2) || '0.00'}
                      </p>
                      <p className="text-xs text-gray-400">Total locked funds</p>
                    </div>
                    <FaWallet className="text-3xl text-blue-500" />
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6 border-l-4 border-green-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm text-gray-500">Available to Withdraw</h3>
                      <p className="text-2xl font-bold text-green-600">
-                        E{stats?.availableForWithdrawal?.toFixed(2) || '0.00'}
+                        E{vaultInfo?.depositSummary?.totalLockedAmount?.toFixed(2) || '0.00'}
                      </p>
                      <p className="text-xs text-gray-400">After fees & penalties</p>
                    </div>
                    <FaMoneyBillWave className="text-3xl text-green-500" />
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6 border-l-4 border-yellow-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm text-gray-500">Active Deposits</h3>
                      <p className="text-2xl font-bold text-yellow-600">
                        {stats?.activeDeposits || 0}
                      </p>
                      <p className="text-xs text-gray-400">Currently locked</p>
                    </div>
                    <FaLock className="text-3xl text-yellow-500" />
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6 border-l-4 border-red-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm text-gray-500">Total Penalties</h3>
                      <p className="text-2xl font-bold text-red-600">
                        E{stats?.penaltyAmount?.toFixed(2) || '0.00'}
                      </p>
                      <p className="text-xs text-gray-400">Fees paid</p>
                    </div>
                    <FaExclamationTriangle className="text-3xl text-red-500" />
                  </div>
                </div>
              </section>

              {/* Quick Info */}
              <section className="bg-white shadow rounded-lg p-6">
                <h3 className="font-semibold text-lg text-momoBlue mb-4 flex items-center gap-2">
                  <FaInfoCircle />
                  Withdrawal Rules
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border-2 border-yellow-300 bg-yellow-50 rounded-lg p-4 text-center">
-                    <FaCalendarAlt className="text-yellow-600 text-2xl mx-auto mb-2" />
-                    <p className="font-semibold">1-3 Days Lock</p>
-                    <p className="text-sm text-gray-600">10% penalty + E5 fee if early</p>
+                    <FaExclamationTriangle className="text-yellow-600 text-2xl mx-auto mb-2" />
+                    <p className="font-semibold">Early Withdrawal</p>
+                    <p className="text-sm text-gray-600">10% penalty + E5 fee per deposit</p>
                  </div>
                  <div className="border-2 border-green-300 bg-green-50 rounded-lg p-4 text-center">
-                    <FaCalendarAlt className="text-green-600 text-2xl mx-auto mb-2" />
-                    <p className="font-semibold">7+ Days Lock</p>
-                    <p className="text-sm text-gray-600">Only E5 fee (no penalty)</p>
+                    <FaMoneyBillWave className="text-green-600 text-2xl mx-auto mb-2" />
+                    <p className="font-semibold">Individual Deposits</p>
+                    <p className="text-sm text-gray-600">Select specific deposits to withdraw</p>
                  </div>
                  <div className="border-2 border-blue-300 bg-blue-50 rounded-lg p-4 text-center">
-                    <FaClock className="text-blue-600 text-2xl mx-auto mb-2" />
-                    <p className="font-semibold">24 Hour Rule</p>
-                    <p className="text-sm text-gray-600">Wait 24h after deposit</p>
+                    <FaArrowDown className="text-blue-600 text-2xl mx-auto mb-2" />
+                    <p className="font-semibold">Immediate Access</p>
+                    <p className="text-sm text-gray-600">No waiting period required</p>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* Deposits Tab */}
          {activeTab === 'deposits' && (
            <section className="bg-white shadow rounded-lg p-6">
              <h3 className="font-semibold text-lg text-momoBlue mb-4">My Locked Deposits</h3>
              {vaultInfo?.lockedDeposits?.length > 0 ? (
                <div className="space-y-4">
                  {vaultInfo.lockedDeposits.map((deposit, index) => {
-                    const statusInfo = getDepositStatus(deposit);
-                    const StatusIcon = statusInfo.icon;
+                    const now = new Date();
+                    const endTime = new Date(deposit.startDate);
+                    endTime.setDate(endTime.getDate() + deposit.lockPeriodInDays);
+                    const isMatured = now >= endTime;
+                    const canWithdraw = true; // No waiting period
                     
                     return (
                       <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                         <div className="flex justify-between items-start">
                           <div className="flex-1">
                             <div className="flex items-center gap-2 mb-2">
                               <FaMoneyBillWave className="text-green-600" />
                               <span className="font-semibold text-lg">E{deposit.amount}</span>
                               <span className="text-sm text-gray-500">
                                 ({deposit.lockPeriodInDays} day{deposit.lockPeriodInDays !== 1 ? 's' : ''} lock)
                               </span>
                             </div>
                             <div className="text-sm text-gray-600 space-y-1">
                               <p>Deposited: {formatDate(deposit.createdAt)}</p>
                               <p>Matures: {formatDate(deposit.endDate || deposit.startDate)}</p>
                             </div>
                           </div>
                           <div className="text-right">
-                            <div className={`flex items-center gap-1 ${statusInfo.color} font-semibold`}>
-                              <StatusIcon />
-                              <span className="text-sm">{statusInfo.status}</span>
+                            <div className={`flex items-center gap-1 ${
+                              deposit.status !== 'locked' ? 'text-gray-600' :
+                              isMatured ? 'text-green-600' : 'text-yellow-600'
+                            } font-semibold`}>
+                              {deposit.status !== 'locked' ? <FaUnlock /> :
+                               isMatured ? <FaUnlock /> : <FaExclamationTriangle />}
+                              <span className="text-sm">
+                                {deposit.status !== 'locked' ? deposit.status :
+                                 isMatured ? 'Ready' : 'Early (10% penalty)'}
+                              </span>
                             </div>
                             <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                               deposit.status === 'locked' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                             }`}>
                               {deposit.status}
                             </span>
                           </div>
                         </div>
                       </div>
                     );
                   })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaLock className="text-4xl mx-auto mb-4 opacity-50" />
                  <p>No deposits found</p>
                  <button
                    onClick={goToDeposit}
                    className="mt-4 bg-momoYellow text-momoBlue px-4 py-2 rounded-lg hover:brightness-110"
                  >
                    Make Your First Deposit
                  </button>
                </div>
              )}
            </section>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <section className="bg-white shadow rounded-lg p-6">
              <h3 className="font-semibold text-lg text-momoBlue mb-4">Transaction History</h3>
              {vaultInfo?.recentTransactions?.length > 0 ? (
                <div className="space-y-3">
                  {vaultInfo.recentTransactions.map((transaction, index) => (
                    <div key={index} className={`border-l-4 p-4 rounded-lg ${getTransactionColor(transaction.type)}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          {getTransactionIcon(transaction.type)}
                          <div>
                            <p className="font-semibold capitalize">{transaction.type}</p>
                            <p className="text-sm text-gray-600">{formatDate(transaction.createdAt)}</p>
                            {transaction.momoTransactionId && (
                              <p className="text-xs text-gray-500 font-mono">
                                ID: {transaction.momoTransactionId.substring(0, 8)}...
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">
                            {transaction.type === 'deposit' ? '+' : '-'}E{transaction.amount?.toFixed(2) || '0.00'}
                          </p>
                          {transaction.penaltyFee > 0 && (
                            <p className="text-xs text-red-600">
                              Penalty: E{transaction.penaltyFee.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaExchangeAlt className="text-4xl mx-auto mb-4 opacity-50" />
                  <p>No transactions found</p>
                </div>
              )}
            </section>
          )}

          {/* Withdrawals Tab */}
          {activeTab === 'withdrawals' && (
            <section className="bg-white shadow rounded-lg p-6">
              <h3 className="font-semibold text-lg text-momoBlue mb-4">Withdrawal History</h3>
              {vaultInfo?.recentTransactions?.filter(t => t.type === 'withdrawal').length > 0 ? (
                <div className="space-y-3">
                  {vaultInfo.recentTransactions
                    .filter(t => t.type === 'withdrawal')
                    .map((withdrawal, index) => (
                      <div key={index} className="border-l-4 border-l-blue-500 bg-blue-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <FaArrowDown className="text-blue-600" />
                            <div>
                              <p className="font-semibold">Withdrawal</p>
                              <p className="text-sm text-gray-600">{formatDate(withdrawal.createdAt)}</p>
                              {withdrawal.momoTransactionId && (
                                <p className="text-xs text-gray-500 font-mono">
                                  Ref: {withdrawal.momoTransactionId.substring(0, 12)}...
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-lg text-blue-600">
                              E{withdrawal.amount?.toFixed(2) || '0.00'}
                            </p>
                            {withdrawal.penaltyFee > 0 && (
                              <p className="text-xs text-red-600">
                                Total fees: E{withdrawal.penaltyFee.toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaArrowDown className="text-4xl mx-auto mb-4 opacity-50" />
                  <p>No withdrawals yet</p>
                  <button
                    onClick={goToWithdraw}
                    className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Make a Withdrawal
                  </button>
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </>
  );
}