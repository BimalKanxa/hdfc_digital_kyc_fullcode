"use client";

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

export default function SelfieUpload() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [captured, setCaptured] = useState(false);
  const [imageData, setImageData] = useState("");

  const API = process.env.NEXT_PUBLIC_API_URL;

  // Start camera
  useEffect(() => {
    async function enableCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error(err);
        setMessage("Unable to access camera. Please allow camera permission.");
      }
    }
    enableCamera();
  }, []);

  // Capture photo
  const captureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL("image/jpeg");
    setImageData(dataUrl);
    setCaptured(true);
  };

  // Upload selfie + Face Match
  const uploadSelfie = async () => {
    if (!imageData) {
      setMessage("Please capture your selfie first");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const kycId = localStorage.getItem("kycId");

      // Convert dataURL → File
      const blob = await (await fetch(imageData)).blob();
      const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });

      // Upload selfie image
      const formData = new FormData();
      formData.append("selfie", file);

      const uploadRes = await axios.post(`${API}/api/upload-selfie`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "x-kyc-id": kycId
        }
      });


      setMessage("Face match successful! Completing KYC...");

      setTimeout(() => {
        window.location.href = "/kyc-success";
      }, 1500);

    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Face match failed. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md text-center">

        <h2 className="text-black text-2xl font-bold mb-4">Photo Verification</h2>

        {!captured && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg border mb-4"
            ></video>

            <button
              onClick={captureImage}
              className=" cursor-pointer w-full bg-blue-600 text-white py-3 rounded-lg font-semibold"
            >
              Capture Selfie
            </button>
          </>
        )}

        {captured && (
          <>
            <img
              src={imageData}
              alt="Captured Selfie"
              className="w-full h-48 object-cover rounded-lg border mb-4"
            />

            <button
              onClick={() => setCaptured(false)}
              className="cursor-pointer w-full bg-gray-900 py-3 rounded-lg font-semibold mb-3"
            >
              Retake Selfie
            </button>

            <button
              onClick={uploadSelfie}
              disabled={loading}
              className="cursor-pointer w-full bg-green-600 text-white py-3 rounded-lg font-semibold"
            >
              {loading ? "Processing..." : "Submit Selfie"}
            </button>
          </>
        )}

        <canvas ref={canvasRef} className="hidden"></canvas>

        {message && <p className="mt-4 text-center text-green-500">{message}</p>}
      </div>
    </div>
  );
}
