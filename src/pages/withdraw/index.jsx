import { useState, useEffect } from "react";
import axiosInstance from "@/api/axiosInstance";
import { 
  FaArrowCircleDown, 
  FaInfoCircle, 
  FaSpinner, 
  FaCheckSquare,
  FaSquare,
  FaMoneyBillWave,
  FaExclamationTriangle,
  FaCalendarAlt
} from "react-icons/fa";

export default function WithdrawPage() {
  const [loading, setLoading] = useState(false);
  const [loadingDeposits, setLoadingDeposits] = useState(true);
  const [message, setMessage] = useState(null);
  const [withdrawableDeposits, setWithdrawableDeposits] = useState([]);
  const [selectedDeposits, setSelectedDeposits] = useState([]);
  const [formData, setFormData] = useState({
    phoneNumber: ""
  });

  // Fetch withdrawable deposits on component mount
  useEffect(() => {
    fetchWithdrawableDeposits();
  }, []);

  const fetchWithdrawableDeposits = async () => {
    try {
      setLoadingDeposits(true);
      const response = await axiosInstance.get("/api/withdrawable-deposits");
      setWithdrawableDeposits(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch withdrawable deposits:", error);
      setMessage({
        type: "error",
        text: "Failed to load withdrawable deposits. Please refresh the page."
      });
    } finally {
      setLoadingDeposits(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDepositSelection = (depositId) => {
    setSelectedDeposits(prev => {
      if (prev.includes(depositId)) {
        return prev.filter(id => id !== depositId);
      } else {
        return [...prev, depositId];
      }
    });
  };

  const selectAllDeposits = () => {
    if (selectedDeposits.length === withdrawableDeposits.length) {
      setSelectedDeposits([]);
    } else {
      setSelectedDeposits(withdrawableDeposits.map(d => d.depositId));
    }
  };

  const calculateTotals = () => {
    const selectedDepositData = withdrawableDeposits.filter(d => 
      selectedDeposits.includes(d.depositId)
    );
    
    return {
      totalAmount: selectedDepositData.reduce((sum, d) => sum + d.amount, 0),
      totalPenalties: selectedDepositData.reduce((sum, d) => sum + d.penalty, 0),
      totalFees: selectedDepositData.length * 5, // E5 per deposit
      totalNet: selectedDepositData.reduce((sum, d) => sum + d.netAmount, 0),
      count: selectedDepositData.length
    };
  };

  const validateForm = () => {
    if (!formData.phoneNumber.trim()) {
      setMessage({ type: "error", text: "Phone number is required" });
      return false;
    }
    
    if (selectedDeposits.length === 0) {
      setMessage({ type: "error", text: "Please select at least one deposit to withdraw" });
      return false;
    }

    return true;
  };

  const handleWithdraw = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setMessage(null);

    try {
      // Generate disbursement token first
      await axiosInstance.post("/momo-api/generate-token");

      // Process withdrawal with selected deposit IDs
      const response = await axiosInstance.post("/api/withdraw", {
        phoneNumber: formData.phoneNumber,
        depositIds: selectedDeposits
      });

      if (response.data.success) {
        const { data } = response.data;
        setMessage({
          type: "success",
          text: `Withdrawal successful!\n` +
                `Total Withdrawn: E${data.totalWithdrawn}\n` +
                `Total Fees: E${data.totalFees}\n` +
                `Total Penalties: E${data.totalPenalties}\n` +
                `Deposits Processed: ${data.depositsProcessed}\n` +
                `Reference ID: ${data.referenceId}`
        });

        // Reset form and refresh deposits
        setFormData({ phoneNumber: "" });
        setSelectedDeposits([]);
        fetchWithdrawableDeposits();
      }
    } catch (error) {
      console.error("Withdrawal error:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "Withdrawal failed. Please try again.";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totals = calculateTotals();

  if (loadingDeposits) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-blue-600">
          <FaSpinner className="animate-spin" />
          <span>Loading your deposits...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-blue-600 mb-2">
            Individual Deposit Withdrawal
          </h2>
          <p className="text-gray-600">Select specific deposits to withdraw from</p>
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`text-sm whitespace-pre-line px-4 py-3 rounded-md ${
              message.type === "success"
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-red-100 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Deposits Selection */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Your Withdrawable Deposits
              </h3>
              {withdrawableDeposits.length > 0 && (
                <button
                  onClick={selectAllDeposits}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {selectedDeposits.length === withdrawableDeposits.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>

            {withdrawableDeposits.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FaMoneyBillWave className="text-4xl mx-auto mb-4 opacity-50" />
                <p>No deposits available for withdrawal</p>
                <p className="text-sm mt-2">Make a deposit to get started</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {withdrawableDeposits.map((deposit) => (
                  <div
                    key={deposit.depositId}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedDeposits.includes(deposit.depositId)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleDepositSelection(deposit.depositId)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {selectedDeposits.includes(deposit.depositId) ? (
                          <FaCheckSquare className="text-blue-600 text-lg" />
                        ) : (
                          <FaSquare className="text-gray-400 text-lg" />
                        )}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <FaMoneyBillWave className="text-green-600" />
                            <span className="font-semibold text-lg">E{deposit.amount}</span>
                            <span className="text-sm text-gray-500">
                              ({deposit.lockPeriodInDays} day{deposit.lockPeriodInDays !== 1 ? 's' : ''})
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center gap-1">
                              <FaCalendarAlt className="text-gray-400" />
                              <span>Deposited: {formatDate(deposit.depositDate)}</span>
                            </div>
                            {deposit.isEarlyWithdrawal && (
                              <div className="flex items-center gap-1 text-orange-600">
                                <FaExclamationTriangle />
                                <span>Early withdrawal (10% penalty)</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">E{deposit.netAmount}</p>
                        <p className="text-xs text-gray-500">Net amount</p>
                        {deposit.penalty > 0 && (
                          <p className="text-xs text-red-500">-E{deposit.penalty} penalty</p>
                        )}
                        <p className="text-xs text-red-500">-E{deposit.flatFee} fee</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Withdrawal Summary & Form */}
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Withdrawal Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Selected Deposits:</span>
                  <span className="font-semibold">{totals.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-semibold">E{totals.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Total Penalties:</span>
                  <span>-E{totals.totalPenalties.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Total Fees:</span>
                  <span>-E{totals.totalFees.toFixed(2)}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold text-green-600">
                  <span>You'll Receive:</span>
                  <span>E{totals.totalNet.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Phone Number Input */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Withdrawal Details
              </h3>
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="76123456 or 26876123456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter Eswatini mobile number (76, 78, or 79 prefix)
                </p>
              </div>

              {/* Withdrawal Button */}
              <button
                onClick={handleWithdraw}
                disabled={loading || selectedDeposits.length === 0}
                className={`w-full mt-4 py-3 rounded-md text-white font-semibold flex items-center justify-center gap-2 transition-colors ${
                  loading || selectedDeposits.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FaArrowCircleDown />
                    Withdraw Selected Deposits
                  </>
                )}
              </button>
            </div>

            {/* Fee Information */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <FaInfoCircle className="text-blue-600" />
                Fee Structure
              </h4>
              <ul className="space-y-1 text-gray-600">
                <li>• E5 flat fee per deposit withdrawal</li>
                <li>• 10% early withdrawal penalty (if before maturity)</li>
                <li>• No waiting period - withdraw immediately</li>
                <li>• Each deposit processed independently</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}