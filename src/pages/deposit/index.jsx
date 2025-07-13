@@ .. @@
   const lockPeriodOptions = [
-    { days: 1, label: "1 Day", penalty: "10% if withdrawn early", color: "bg-yellow-100 border-yellow-300" },
-    { days: 2, label: "2 Days", penalty: "10% if withdrawn early", color: "bg-orange-100 border-orange-300" },
-    { days: 3, label: "3 Days", penalty: "10% if withdrawn early", color: "bg-red-100 border-red-300" },
-    { days: 7, label: "1 Week", penalty: "No penalty", color: "bg-green-100 border-green-300" },
-    { days: 30, label: "1 Month", penalty: "No penalty", color: "bg-blue-100 border-blue-300" },
+    { days: 1, label: "1 Day", penalty: "10% if withdrawn early", color: "bg-yellow-100 border-yellow-300" },
+    { days: 2, label: "2 Days", penalty: "10% if withdrawn early", color: "bg-orange-100 border-orange-300" },
+    { days: 3, label: "3 Days", penalty: "10% if withdrawn early", color: "bg-red-100 border-red-300" },
+    { days: 7, label: "1 Week", penalty: "10% if withdrawn early", color: "bg-green-100 border-green-300" },
+    { days: 30, label: "1 Month", penalty: "10% if withdrawn early", color: "bg-blue-100 border-blue-300" },
   ];
@@ .. @@
             <p className="text-xs text-gray-500 mt-2">
-              Early withdrawal from 1-3 day locks incurs a 10% penalty + E5 fee
+              Early withdrawal incurs a flat 10% penalty + E5 fee for all lock periods
             </p>
@@ .. @@
           <ul className="space-y-1 text-gray-600">
             <li>• Minimum deposit: E10</li>
             <li>• Funds are locked for the selected period</li>
-            <li>• Early withdrawal from 1-3 day locks: 10% penalty + E5 fee</li>
-            <li>• Withdrawals available 24 hours after deposit</li>
+            <li>• Early withdrawal: flat 10% penalty + E5 fee</li>
+            <li>• Withdrawals available immediately after deposit</li>
             <li>• All transactions are secured by MoMo API</li>
           </ul>