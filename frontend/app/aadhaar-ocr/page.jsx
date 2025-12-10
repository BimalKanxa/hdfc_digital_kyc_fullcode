"use client";

//this page is obsolet and will be removed in future updated
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AadhaarOCR() {
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const kycId = localStorage.getItem("kycId");
    const documentUrl = ""; // optional: store Aadhaar image URL in LS if you want

    const runOCR = async () => {
      try {
        const res = await axios.post(
          `${API}/api/ocr-aadhaar`,
          { documentUrl },
          { headers: { "x-kyc-id": kycId } }
        );

        setMsg("Aadhaar OCR successful. Moving to OTP verification...");

        setTimeout(() => {
          window.location.href = "/aadhaar-otp";
        }, 1500);

      } catch (error) {
        console.error(error);
        setMsg("OCR failed. Please re-upload Aadhaar.");
        setLoading(false);
      }
    };

    runOCR();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-lg text-center">
        {loading ? (
          <>
            <div className="loader mb-4"></div>
            <p>Processing Aadhaar OCR...</p>
          </>
        ) : (
          <p className="text-red-500">{msg}</p>
        )}

        {msg && <p className="mt-4 text-green-600">{msg}</p>}
      </div>

      <style>{`
        .loader {
          border: 4px solid #f3f3f3;
          border-radius: 50%;
          border-top: 4px solid #3498db;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
