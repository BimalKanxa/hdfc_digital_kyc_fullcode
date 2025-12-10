"use client";

import React, { useEffect, useState } from "react";
import { adminAxios } from "@/lib/adminApi";
import { useRouter, useParams } from "next/navigation";

export default function KycDetail() {
  const params = useParams();
  const kycId = params.kycId; 
  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const axios = adminAxios();
  const router = useRouter();

  useEffect(() => {
    fetchKyc();
  }, []);

  const fetchKyc = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/kycs/${kycId}`);
      setKyc(res.data.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        window.location.href = "/admin/login";
      }
    }
    setLoading(false);
  };

  const handleApprove = async () => {
    try {
      await axios.post(`/api/admin/kycs/${kycId}/approve`, {});
      setActionMsg("KYC approved");
      setTimeout(() => router.push("/admin/kycs"), 900);
    } catch (err) {
      console.error(err);
      setActionMsg(err.response?.data?.message || "Approve failed");
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setActionMsg("Please enter rejection reason");
      return;
    }
    try {
      await axios.post(`/api/admin/kycs/${kycId}/reject`, { reason: rejectReason });
      setActionMsg("KYC rejected");
      setTimeout(() => router.push("/admin/kycs"), 900);
    } catch (err) {
      console.error(err);
      setActionMsg(err.response?.data?.message || "Reject failed");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!kyc) return <div className="min-h-screen flex items-center justify-center">KYC not found</div>;

  // fallback test document path (your uploaded file)
  const sampleDoc = "/mnt/data/Digital KYC_Reduce Drop-Off_Lift Conversion.docx";

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-black">
      <div className="max-w-4xl mx-auto bg-white rounded shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold">KYC Details</h2>
            <p className="text-sm text-gray-600">KYC ID: {kyc._id}</p>
            <p className="text-sm text-gray-600">User: {kyc.user?.name} — {kyc.user?.phone}</p>
            <p className="text-sm text-gray-600">Status: <span className="font-semibold">{kyc.status}</span></p>
          </div>

          <div className="flex gap-2">
            <button onClick={handleApprove} className="cursor-pointer px-4 py-2 bg-green-600 text-white rounded">Approve</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-2">Aadhaar</h4>
            <div className="border p-3 rounded">
              <p className="text-sm">Aadhaar Number: {kyc.aadhaar?.extractedData?.aadhaarNumber || "N/A"}</p>
              <p className="text-sm">Name: {kyc.aadhaar?.extractedData?.name || "N/A"}</p>
              <p className="text-sm">DOB: {kyc.aadhaar?.extractedData?.dob || "N/A"}</p>
              <div className="mt-3">
                <img
                  src={kyc.aadhaar?.documentUrl || sampleDoc}
                  alt="aadhaar"
                  className="w-full h-48 object-contain bg-gray-100 rounded"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">PAN</h4>
            <div className="border p-3 rounded">
              <p className="text-sm">PAN: {kyc.pan?.extractedData?.panNumber || "N/A"}</p>
              <p className="text-sm">Name: {kyc.pan?.extractedData?.name || "N/A"}</p>
              <p className="text-sm">DOB: {kyc.pan?.extractedData?.dob || "N/A"}</p>
              <div className="mt-3">
                <img
                  src={kyc.pan?.documentUrl || sampleDoc}
                  alt="pan"
                  className="w-full h-48 object-contain bg-gray-100 rounded"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Selfie & Face Match</h4>
            <div className="border p-3 rounded">
              <p className="text-sm">Face Score: {kyc.faceMatch?.score ?? "N/A"}</p>
              <p className="text-sm">Verified: {kyc.faceMatch?.verified ? "Yes" : "No"}</p>

              <div className="mt-3">
                <img
                  src={kyc.faceMatch?.selfieUrl || sampleDoc}
                  alt="selfie"
                  className="w-full h-48 object-contain bg-gray-100 rounded"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Meta</h4>
            <div className="border p-3 rounded space-y-2">
              <p className="text-sm">Attempts: Aadhaar {kyc.aadhaar?.attempts ?? 0} | PAN {kyc.pan?.attempts ?? 0}</p>
              <p className="text-sm">Failure Reason: {kyc.failureReason || "N/A"}</p>
              <p className="text-sm">Created At: {new Date(kyc.createdAt).toLocaleString()}</p>
              <p className="text-sm">Updated At: {new Date(kyc.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <textarea
            placeholder="Reason for rejection (if rejecting)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="w-full border p-2 rounded h-24"
          />

          <div className="flex gap-3 mt-3">
            <button onClick={handleReject} className="cursor-pointer px-4 py-2 bg-red-600 text-white rounded">Reject KYC</button>
            <button onClick={() => router.push("/admin/kycs")} className="px-4 py-2 bg-gray-200 rounded">Back</button>
          </div>

          {actionMsg && <p className="mt-3 text-sm text-red-600">{actionMsg}</p>}
        </div>
      </div>
    </div>
  );
}
