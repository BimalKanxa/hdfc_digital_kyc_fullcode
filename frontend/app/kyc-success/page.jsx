"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

export default function KycSuccess() {
  const [kycDetails, setKycDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const API = process.env.NEXT_PUBLIC_API_URL;

  const mask = (value) => {
    if (!value) return "";
    return value.replace(/.(?=.{4})/g, "*"); // keep last 4 chars
  };

  useEffect(() => {
    const fetchKyc = async () => {
      try {
        const kycId = localStorage.getItem("kycId");
        if (!kycId) {
          setLoading(false);
          return;
        }

        const res = await axios.get(`${API}/api/get-kyc/${kycId}`);

        setKycDetails(res.data.kyc);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    fetchKyc();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-lg">
        Finalizing your KYC...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full text-center">

        <h1 className="text-3xl font-bold text-green-600 mb-2">
          🎉 KYC Completed!
        </h1>

        <p className="text-gray-600 mb-6">
          Your identity verification was successful. You may now continue using our services.
        </p>

        <div className="bg-gray-50 p-5 rounded-xl text-left mb-6 shadow-inner text-black">

          <h3 className="text-black font-semibold text-lg mb-2">KYC Summary</h3>

          {kycDetails ? (
            <>
              <p><strong>KYC ID:</strong> {kycDetails._id}</p>

              <p><strong>Aadhaar Number:</strong> 
                {kycDetails.aadhaar?.extractedData?.aadhaarNumber
                  ? mask(kycDetails.aadhaar.extractedData.aadhaarNumber)
                  : "N/A"}
              </p>

              <p><strong>PAN Number:</strong> 
                {kycDetails.pan?.extractedData?.panNumber
                  ? mask(kycDetails.pan.extractedData.panNumber)
                  : "N/A"}
              </p>

              <p><strong>Date of Birth:</strong> 
                {kycDetails.aadhaar?.extractedData?.dob || "N/A"}
              </p>

              <p><strong>Status:</strong> 
                <span className="text-green-600 font-semibold">
                  {kycDetails.status}
                </span>
                <span className="block mt-4 italic">You will be notified once KYC status is Approved</span>
              </p>
            </>
          ) : (
            <p>No details available</p>
          )}
        </div>


        <button
          onClick={() => (window.location.href = "/")}
          className="cursor-pointer w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold"
        >
          Close
        </button>
      </div>
    </div>
  );
}
