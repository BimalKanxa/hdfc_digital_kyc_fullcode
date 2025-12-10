"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import KycProgressBar from "../../components/KycProgressBar";

export default function AadhaarOTP() {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(30); // resend cooldown
  const [expireTimer, setExpireTimer] = useState(300); // OTP expiry (5 min)
  const [loading, setLoading] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL;

  const kycId = typeof window !== "undefined" ? localStorage.getItem("kycId") : "";

  // Auto-send OTP when entering this page
  const sendOtp = async (showMessage = false) => {
    try {
      await axios.post(
        `${API}/api/aadhaar/send-otp`,
        {}, 
        { headers: { "x-kyc-id": kycId } }
      );

      if (showMessage) setMessage("OTP resent successfully.");

      // restart timers
      setTimer(30);
      setExpireTimer(300);

    } catch (err) {
      console.error(err);
      setMessage("Error sending OTP");
    }
  };

  // Auto-send OTP on page load
  useEffect(() => {
    sendOtp();
  }, []);

  // Countdown timers
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((t) => (t > 0 ? t - 1 : 0));
      setExpireTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setMessage("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await axios.post(
        `${API}/api/aadhaar/verify-otp`,
        { otp },
        { headers: { "x-kyc-id": kycId } }
      );

      setMessage("OTP Verified! Moving to PAN upload...");

      setTimeout(() => {
        window.location.href = "/pan-upload";
      }, 1500);

    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message || "OTP verification failed"
      );
    }

    setLoading(false);
  };

  return (
    <>
    <KycProgressBar stage={"AADHAAR_OTP"}/>
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">

        <h2 className="text-black text-2xl font-bold text-center mb-4">Aadhaar OTP Verification</h2>

        <div className="mb-4">
          <p className="text-gray-600 text-center">
            We sent an OTP to your registered phone number.
          </p>

          <p className="text-center mt-2 font-semibold text-blue-600">
            Expires in: {Math.floor(expireTimer / 60)}:
            {String(expireTimer % 60).padStart(2, "0")}
          </p>
        </div>

        <input
          type="number"
          maxLength={6}
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="text-black placeholder-gray-200 w-full p-3 border rounded-lg mb-4"
        />

        <button
          onClick={verifyOtp}
          disabled={loading}
          className="cursor-pointer w-full bg-blue-600 text-white py-3 rounded-lg font-semibold"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        {/* Resend OTP */}
        <button
          onClick={() => sendOtp(true)}
          disabled={timer !== 0}
          className="w-full mt-3 bg-gray-900 py-3 rounded-lg font-semibold"
        >
          {timer === 0 ? "Resend OTP" : `Resend OTP in ${timer}s`}
        </button>

        {message && (
          <p className="mt-4 text-center text-green-600">{message}</p>
        )}
      </div>
    </div>
    </>
  );
}
