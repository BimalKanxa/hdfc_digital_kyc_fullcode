
"use client";

import React, { useState } from "react";
import axios from "axios";

export default function CreateUser() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const API = process.env.NEXT_PUBLIC_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const res = await axios.post(`${API}/api/create-user`, {
        name,
        phone,
        email,
      });

      const { userId, kycId } = res.data;
      localStorage.setItem("userId", userId);
      localStorage.setItem("kycId", kycId);

      const stage = res.data.kycStage;

      switch(stage) {
  case "AADHAAR_UPLOAD":
    window.location.href = "/aadhaar-upload";
    break;

  case "AADHAAR_OTP":
    window.location.href = "/aadhaar-otp";
    break;

  case "PAN_UPLOAD":
    window.location.href = "/pan-upload";
    break;

  case "SIGNATURE_UPLOAD":
    window.location.href = "/upload-signature";
    break;

  case "PHOTO_UPLOAD":
    window.location.href = "/upload-passport-photo";
    break;

  case "FACE_MATCH":
    window.location.href = "/selfie-upload";
    break;
// case "KYC_APPROVAL":
//     window.location.href = "/kyc-status";
//     break;

  default:
    window.location.href = "/aadhaar-upload";
}


      setMsg("User created. Starting KYC...");

    } catch (err) {
      console.error(err);
      setMsg("Error creating user");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-blue-200 p-6 rounded-xl shadow-lg w-full max-w-md">

        <h2 className="text-black text-2xl font-bold text-center mb-4">Create User</h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input className="text-black placeholder-black w-full p-3 border rounded-lg"
            placeholder="Name" onChange={(e) => setName(e.target.value)} />

          <input className="text-black placeholder-black w-full p-3 border rounded-lg"
            placeholder="Phone" onChange={(e) => setPhone(e.target.value)} required />

          <input className="text-black placeholder-black w-full p-3 border rounded-lg"
            placeholder="Email" onChange={(e) => setEmail(e.target.value)} />

          <button className="w-full bg-blue-600 text-white py-3 rounded-lg">
            {loading ? "Creating..." : "Start KYC"}
          </button>

        </form>

        {msg && <p className="text-center text-green-600 mt-4">{msg}</p>}
      </div>
    </div>
  );
}
