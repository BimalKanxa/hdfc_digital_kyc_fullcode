"use client";

import React, { useState } from "react";
import axios from "axios";
import KycProgressBar from "../../components/KycProgressBar";


export default function PANUpload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL;

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

  const handleFileChange = (e) => {
    setMsg("");
    const f = e.target.files[0];
    if (!f) return;
    // Basic validation
    if (!["image/jpeg", "image/png", "image/jpg"].includes(f.type)) {
      setMsg("Only JPG / PNG images are allowed for PAN.");
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setMsg("File too large. Please select a file under 5MB.");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async () => {
    setMsg("");
    if (!file) {
      setMsg("Please select a PAN image first.");
      return;
    }

    setLoading(true);

    try {
      // 1) Upload file to upload-document endpoint
      const formData = new FormData();
      formData.append("document", file);

     const uploadRes = await axios.post(`${API}/api/upload-pan`, formData, {
  headers: {
    "Content-Type": "multipart/form-data",
    "x-kyc-id": localStorage.getItem("kycId")
  },
});


      // 2) Attach PAN to existing KYC
      // const kycId = typeof window !== "undefined" ? localStorage.getItem("kycId") : null;
      // if (!kycId) {
      //   setMsg("KYC ID not found. Please restart the flow.");
      //   setLoading(false);
      //   return;
      // }

      // Call your backend to save PAN into KYC: expects header x-kyc-id
      // Backend route expected: POST /api/upload-pan { documentUrl }
      // await axios.post(`${API}/api/upload-pan`, { documentUrl }, {
      //   headers: { "x-kyc-id": kycId }
      // });

      setMsg("PAN uploaded successfully.");
      setTimeout(() => {
        window.location.href = "/upload-signature";
      }, 1200);

    } catch (err) {
      console.error(err);
      setMsg(err.response?.data?.message || "PAN upload failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // For local dev/testing: use the uploaded file path as a documentUrl
  // Developer note: /mnt/data/... will be converted to a reachable URL by the test tooling
  // const useSampleFilePath = async () => {
  //   setMsg("");
  //   setLoading(true);
  //   try {
  //     // Use the local path from your uploaded files (dev/testing only)
  //     const sampleLocalPath = "/mnt/data/Digital KYC_Reduce Drop-Off_Lift Conversion.docx";

  //     // Skip the upload-document step and directly call upload-pan with test documentUrl
  //     const kycId = typeof window !== "undefined" ? localStorage.getItem("kycId") : null;
  //     if (!kycId) {
  //       setMsg("KYC ID not found. Please create user and upload Aadhaar first.");
  //       setLoading(false);
  //       return;
  //     }

  //     // Call backend to attach PAN with the local path (the environment will transform it)
  //     await axios.post(`${API}/api/upload-pan`, { documentUrl: sampleLocalPath }, {
  //       headers: { "x-kyc-id": kycId }
  //     });

  //     setMsg("Sample PAN attached. Redirecting to PAN OCR...");
  //     setTimeout(() => {
  //       window.location.href = "/pan-ocr";
  //     }, 1000);

  //   } catch (err) {
  //     console.error(err);
  //     setMsg(err.response?.data?.message || "Test attach failed.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <>
    <KycProgressBar stage="PAN_UPLOAD"/>
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-black text-2xl font-bold text-center mb-4">Upload PAN Card</h2>

        <p className="text-sm text-gray-600 mb-3">
          Please upload a clear image of your PAN card. JPG or PNG only. Max 5MB.
        </p>

        <input type="file" accept="image/*" onChange={handleFileChange} className="text-black rounded-sm p-2 border mb-4" />

        {preview && (
          <img src={preview} alt="preview" className="w-full h-40 object-cover rounded-md mb-3 border" />
        )}

        <button
          onClick={handleUpload}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold mb-3"
        >
          {loading ? "Uploading..." : "Upload PAN"}
        </button>

        {/* <button 
          // onClick={useSampleFilePath}
          disabled={loading}
          className="w-full bg-gray-200 py-3 rounded-lg font-semibold"
        >
          {loading ? "Processing..." : "Use sample test file (dev only)"}
        </button> */}

        {msg && <p className="mt-4 text-center text-green-600">{msg}</p>}
      </div>
    </div>
    </>
  );
}
