// "use client";

// import React, { useState } from "react";
// import axios from "axios";

// export default function AadhaarUpload() {
//   const [file, setFile] = useState(null);
//   const [preview, setPreview] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [msg, setMsg] = useState("");

//   const API = process.env.NEXT_PUBLIC_API_URL;

//   const handleFile = (e) => {
//     const f = e.target.files[0];
//     setFile(f);
//     setPreview(URL.createObjectURL(f));
//   };

//   const uploadAadhaar = async () => {
//     if (!file) {
//       setMsg("Please upload Aadhaar image");
//       return;
//     }

//     setLoading(true);
//     setMsg("");

//     try {
//       // 1. Upload to backend
//       const formData = new FormData();
//       formData.append("document", file);

//     //   const uploadRes = await axios.post(`${API}/api/upload-document`, formData, {
//     //     headers: { "Content-Type": "multipart/form-data" },
//     //   });

//     const uploadRes = await axios.post(
//   `${API}/api/upload-document`,
//   formData,
//   {
//     headers: {
//       "Content-Type": "multipart/form-data",
//       "kyc_id": localStorage.getItem("kycId") || "",  // added
//     },
//   }
// );


//       const documentUrl = uploadRes.data.fileUrl;

//       // 2. Create KYC (since Aadhaar is first mandatory document)
//       const userId = localStorage.getItem("userId");

//       const createKycRes = await axios.post(`${API}/api/create-kyc`, {
//         userId,
//         documentType: "AADHAAR",
//         documentUrl,
//       });

//       const kycId = createKycRes.data.kycId;

//       // Save in local storage
//       localStorage.setItem("kycId", kycId);

//       setMsg("Aadhaar uploaded. Starting OCR...");

//       // Redirect to Aadhaar OCR Step
//       setTimeout(() => {
//         window.location.href = "/aadhaar-ocr";
//       }, 1500);

//     } catch (err) {
//       console.error(err);
//       setMsg("Error uploading Aadhaar");
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex items-center justify-center">
//       <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
//         <h2 className="text-2xl font-bold text-center mb-4">Upload Aadhaar</h2>

//         <input
//           type="file"
//           accept="image/*"
//           className="mb-4"
//           onChange={handleFile}
//         />

//         {preview && (
//           <img
//             src={preview}
//             className="w-full h-48 object-cover rounded-md mb-4 border"
//           />
//         )}

//         <button
//           onClick={uploadAadhaar}
//           disabled={loading}
//           className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold"
//         >
//           {loading ? "Uploading..." : "Upload Aadhaar"}
//         </button>

//         {msg && <p className="text-center mt-4 text-green-600">{msg}</p>}
//       </div>
//     </div>
//   );
// }




"use client";

import React, { useState } from "react";
import axios from "axios";
import KycProgressBar from "../../components/KycProgressBar";


export default function AadhaarUpload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [stage, setStage] = useState("AADHAAR_UPLOAD")

  const API = process.env.NEXT_PUBLIC_API_URL;
  const kycId = typeof window !== "undefined" ? localStorage.getItem("kycId") : null;

  const handleFile = (e) => {
    const f = e.target.files[0];
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const uploadAadhaar = async () => {
    if (!file) {
      setMsg("Please upload Aadhaar image");
      return;
    }

    setLoading(true);

    try {
      // Upload Aadhaar
      const formData = new FormData();
      formData.append("document", file);

      await axios.post(`${API}/api/upload-aadhaar`, formData, {
  headers: {
    "Content-Type": "multipart/form-data",
    "x-kyc-id": kycId
  },
});


      setMsg("Aadhaar uploaded. Starting OCR...");
      setTimeout(() => {
        window.location.href = "/aadhaar-otp";
      }, 1500);

    } catch (err) {
      console.error(err);
      setMsg("Error uploading Aadhaar " + err.response.data.message);
    }

    setLoading(false);
  };

  return (
    <>
      <KycProgressBar stage={stage}/>
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md text-center">

        <h2 className="text-black text-2xl font-bold mb-4 ">Upload Aadhaar</h2>

        <input type="file" onChange={handleFile} className="cursor-pointer text-black border p-2 rounded-sm mb-4" />

        {preview && (
          <img src={preview} className="w-full h-48 object-cover rounded-md mb-4 border" />
        )}

        <button
          onClick={uploadAadhaar}
          className="cursor-pointer w-full bg-blue-600 text-white py-3 rounded-lg font-semibold"
        >
          {loading ? "Uploading..." : "Upload Aadhaar"}
        </button>

        {msg && <p className="mt-4 text-green-600">{msg}</p>}
      </div>
    </div>
    </>
  );
}
