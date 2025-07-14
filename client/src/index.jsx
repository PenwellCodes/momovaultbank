import { useState, useEffect } from "react";
import axiosInstance from "@/api/axiosInstance";
import { FaArrowCircleDown, FaInfoCircle, FaSpinner } from "react-icons/fa";

export default function WithdrawPage() {
  const [loading, setLoading] = useState(false);
  const [loadingVaultInfo, setLoadingVaultInfo] = useState(true);
  const [message, setMessage] = useState(null);
  const [vaultInfo, setVaultInfo] = useState(null);
  const [formData, setFormData] = useState({
    phoneNumber: "",
    amount: ""
  });

  // Fetch vault information on component mount
  useEffect(() => {
    fetchVaultInfo();
  }, []);

  const fetchVaultInfo = async () => {
    try {
      setLoadingVaultInfo(true);
      const response = await axiosInstance.get("/api/vault-info");
      setVaultInfo(response.data.data);
    } catch (error) {
      console.error("Failed to fetch vault info:", error);
      setMessage({
        type: "error",
        text: "Failed to load vault information. Please refresh the page."
      });
    } finally {
      setLoadingVaultInfo(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.phoneNumber.trim()) {
      setMessage({ type: "error", text: "Phone number is required" });
      return false;
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setMessage({ type: "error", text: "Please enter a valid amount" });
      return false;
    }

    if (vaultInfo && parseFloat(formData.amount) > vaultInfo.withdrawalInfo.netAvailable) {
      setMessage({ 
        type: "error", 
        text: `Insufficient funds. Available: E${vaultInfo.withdrawalInfo.netAvailable.toFixed(2)}` 
      });
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

      // Process withdrawal
      const response = await axiosInstance.post("/api/withdraw", {
        phoneNumber: formData.phoneNumber,
        amount: parseFloat(formData.amount)
      });

      if (response.data.success) {
        const { data } = response.data;
        setMessage({
          type: "success",
          text: `Withdrawal successful!\n` +
                `Amount: E${data.withdrawnAmount}\n` +
                `Flat Fee: E${data.flatFee}\n` +
                `Early Withdrawal Penalty: E${data.earlyWithdrawalPenalty || 0}\n` +
                `Total Deducted: E${data.totalDeducted}\n` +
                `Reference ID: ${data.referenceId}`
        });

        // Reset form and refresh vault info
        setFormData({ phoneNumber: "", amount: "" });
        fetchVaultInfo();
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

  if (loadingVaultInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-blue-600">
          <FaSpinner className="animate-spin" />
          <span>Loading vault information...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full space-y-6">
        <h2 className="text-2xl font-bold text-blue-600 text-center">
          Withdraw Funds
        </h2>

        {/* Vault Information Display */}
        {vaultInfo && (
          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-blue-700 font-semibold">
              <FaInfoCircle />
              <span>Vault Information</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Total Locked:</span>
                <span className="font-semibold ml-2">E{vaultInfo.withdrawalInfo.totalLocked.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-600">Penalties:</span>
                <span className="font-semibold ml-2">E{vaultInfo.withdrawalInfo.penalties.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-600">Flat Fee:</span>
                <span className="font-semibold ml-2">E{vaultInfo.withdrawalInfo.flatFee}</span>
              </div>
              <div>
                <span className="text-gray-600">Available:</span>
                <span className="font-semibold ml-2 text-green-600">E{vaultInfo.withdrawalInfo.netAvailable.toFixed(2)}</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Withdrawable Deposits: {vaultInfo.withdrawalInfo.withdrawableDeposits}
            </div>
          </div>
        )}

        {/* Withdrawal Form */}
        <div className="space-y-4">
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
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

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Withdrawal Amount (E)
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="0.00"
              min="1"
              max={vaultInfo?.withdrawalInfo.netAvailable || 0}
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum available: E{vaultInfo?.withdrawalInfo.netAvailable.toFixed(2) || '0.00'}
            </p>
          </div>
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

        {/* Withdrawal Button */}
        <button
          onClick={handleWithdraw}
          
          className={`w-full py-3 rounded-md text-white font-semibold flex items-center justify-center gap-2 transition-colors ${
          
              "bg-blue-600 hover:bg-blue-700"
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
              Withdraw Funds
            </>
          )}
        </button>

      

     

        {/* Fee Information */}
        <div className="bg-gray-50 p-3 rounded-md text-xs text-gray-600">
          <p><strong>Fee Structure:</strong></p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Flat fee: E5 for all withdrawals</li>
            <li>Early withdrawal penalty: 10% (for 1-3 day lock periods only)</li>
            <li>Minimum wait time: 24 hours after deposit</li>
          </ul>
        </div>
      </div>
    </div>
  );
}