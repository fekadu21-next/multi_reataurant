import React, { useState } from "react";

export default function OtpModal({ email, onVerify, loading, onCancel }) {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleContinue = async () => {
    setMessage("");

    // Frontend validation
    if (otp.trim().length !== 6) {
      setMessage("❌ Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setIsVerifying(true);
      await onVerify(otp.trim()); // ✅ parent handles navigation
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold text-center">Verify OTP</h2>

        <p className="text-center text-gray-600">
          Enter the OTP sent to <br />
          <span className="font-semibold">{email}</span>
        </p>

        <input
          type="text"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          className="w-full border rounded-full px-6 py-4 text-center text-xl tracking-widest"
          placeholder="••••••"
        />

        {message && (
          <p
            className={`text-center font-medium ${
              message.startsWith("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        <div className="flex gap-4">
          <button
            onClick={handleContinue}
            disabled={isVerifying || loading}
            className="flex-1 bg-[#ffde00] py-4 rounded-full font-bold hover:bg-black hover:text-white transition disabled:opacity-60"
          >
            {isVerifying || loading ? "Verifying..." : "Continue"}
          </button>

          <button
            onClick={onCancel}
            disabled={isVerifying}
            className="flex-1 bg-gray-300 py-4 rounded-full font-bold hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
