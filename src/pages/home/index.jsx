@@ .. @@
               <div className="border-2 border-yellow-300 bg-yellow-50 rounded-lg p-4 text-center">
                 <FaCalendarAlt className="text-yellow-600 text-2xl mx-auto mb-2" />
-                <p className="font-semibold">1-3 Days Lock</p>
-                <p className="text-sm text-gray-600">10% penalty + E5 fee if early</p>
+                <p className="font-semibold">All Lock Periods</p>
+                <p className="text-sm text-gray-600">Flat 10% penalty + E5 fee if early</p>
               </div>
               <div className="border-2 border-green-300 bg-green-50 rounded-lg p-4 text-center">
-                <FaCalendarAlt className="text-green-600 text-2xl mx-auto mb-2" />
-                <p className="font-semibold">7+ Days Lock</p>
-                <p className="text-sm text-gray-600">Only E5 fee (no penalty)</p>
+                <FaUnlock className="text-green-600 text-2xl mx-auto mb-2" />
+                <p className="font-semibold">After Maturity</p>
+                <p className="text-sm text-gray-600">Only E5 fee (no penalty)</p>
               </div>
               <div className="border-2 border-blue-300 bg-blue-50 rounded-lg p-4 text-center">
-                <FaClock className="text-blue-600 text-2xl mx-auto mb-2" />
-                <p className="font-semibold">24 Hour Rule</p>
-                <p className="text-sm text-gray-600">Wait 24h after deposit</p>
+                <FaSpinner className="text-blue-600 text-2xl mx-auto mb-2" />
+                <p className="font-semibold">Immediate Access</p>
+                <p className="text-sm text-gray-600">Withdraw anytime after deposit</p>
               </div>
@@ .. @@
   const getDepositStatus = (deposit) => {
     const now = new Date();
     const depositTime = new Date(deposit.createdAt);
     const endTime = new Date(deposit.startDate);
     endTime.setDate(endTime.getDate() + deposit.lockPeriodInDays);
     
-    const hoursSinceDeposit = (now - depositTime) / (1000 * 60 * 60);
     const isMatured = now >= endTime;
-    const canWithdraw = hoursSinceDeposit >= 24;

     if (deposit.status !== 'locked') {
       return { status: deposit.status, color: 'text-gray-600', icon: FaUnlock };
     }
     
-    if (!canWithdraw) {
-      return { 
-        status: `Wait ${Math.ceil(24 - hoursSinceDeposit)}h`, 
-        color: 'text-orange-600', 
-        icon: FaClock 
-      };
-    }
-    
     if (isMatured) {
       return { status: 'Ready', color: 'text-green-600', icon: FaUnlock };
     }
     
     return { status: 'Early (10% penalty)', color: 'text-yellow-600', icon: FaExclamationTriangle };
   };