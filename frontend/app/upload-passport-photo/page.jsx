"use client";

import React, { useState } from "react";
import axios from "axios";
import KycProgressBar from "@/components/KycProgressBar";

export default function UploadPassportPhotoPage() {
  const API = process.env.NEXT_PUBLIC_API_URL;
  const kycId = typeof window !== "undefined" ? localStorage.getItem("kycId") : null;

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("PHOTO_UPLOAD");

  const handleFile = (e) => {
    const f = e.target.files[0];
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async () => {
    if (!file) { setMsg("Please choose passport size photo"); return; }
    setLoading(true);
    setMsg("");

    try {
      const fd = new FormData();
      fd.append("document", file);

      const res = await axios.post(`${API}/api/upload-photo`, fd, {
        headers: {
          "Content-Type": "multipart/form-data",
          "x-kyc-id": kycId
        }
      });

      setMsg("Passport photo uploaded. Redirecting to selfie...");
      localStorage.setItem("kycStage", res.data.nextStage);
      setTimeout(() => { window.location.href = "/selfie-upload"; }, 1200);
    } catch (err) {
      console.error(err);
      setMsg(err.response?.data?.message || "Upload failed");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <KycProgressBar stage={stage} />

      <div className="max-w-md mx-auto bg-white p-6 rounded shadow text-black">
        <h2 className="text-xl font-semibold mb-4">Upload Passport-size Photo</h2>

        <input type="file" accept="image/*" onChange={handleFile} className="mb-4" />

        {preview && <img src={preview} className="w-full h-36 object-contain mb-4 border" />}

        <button onClick={handleUpload} disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded">
          {loading ? "Uploading..." : "Upload Passport Photo"}
        </button>

        {msg && <p className="mt-4 text-center text-sm">{msg}</p>}
      </div>
    </div>
  );
}
