"use client";

//this file is obsolet and will be removed in future updates

import React, { useEffect, useState } from "react";
import axios from "axios";

export default function PanOCR() {
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const runOcr = async () => {
      const kycId = localStorage.getItem("kycId");

      if (!kycId) {
        setLoading(false);
        setMsg("KYC ID not found. Please restart the flow.");
        return;
      }

      try {
        // For testing we pass the uploaded local path as documentUrl
        const documentUrl = "/mnt/data/Digital KYC_Reduce Drop-Off_Lift Conversion.docx";

        const res = await axios.post(
          `${API}/api/ocr-pan`,
          { documentUrl },
          { headers: { "x-kyc-id": kycId } }
        );

        setMsg("PAN OCR completed successfully. Moving to selfie capture...");

        setTimeout(() => {
          window.location.href = "/selfie-upload";
        }, 1500);

      } catch (err) {
        console.error(err);
        setMsg(err.response?.data?.message || "OCR failed. Please re-upload PAN.");
        setLoading(false);
      }
    };

    runOcr();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-xl shadow-lg text-center max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Processing PAN OCR...</h2>

        {loading ? (
          <>
            <div className="loader mx-auto mb-4"></div>
            <p>Please wait while we extract PAN details...</p>
          </>
        ) : (
          <p className="text-red-500">{msg}</p>
        )}

        {!loading && msg && (
          <button
            className="mt-5 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold"
            onClick={() => (window.location.href = "/pan-upload")}
          >
            Re-upload PAN
          </button>
        )}

        {msg && loading === true && (
          <p className="mt-4 text-green-600 font-medium">{msg}</p>
        )}
      </div>

      <style>{`
        .loader {
          border: 4px solid #eee;
          border-top: 4px solid #3498db;
          border-radius: 50%;
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
