"use client";

import React, { useEffect, useState } from "react";
import { adminAxios } from "@/lib/adminApi";
import Link from "next/link";

export default function AdminKycList() {
  const [kycs, setKycs] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [stage, setStage] = useState("");
  const [loading, setLoading] = useState(false);
  const axios = adminAxios();

  useEffect(() => {
    fetchKycs();
  }, [page, search, status, stage]);

  const fetchKycs = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (status) params.status = status;
      if (stage) params.stage = stage;

      const res = await axios.get("/api/admin/kycs", { params });
      setKycs(res.data.data);
      setTotalPages(res.data.pagination.totalPages || 1);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        alert("Admin token missing or expired. Please login.");
        window.location.href = "/admin/login";
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">KYC Requests</h2>

          <div className="flex gap-2">
            <button
              onClick={() => {
                localStorage.removeItem("adminToken");
                window.location.href = "/admin/login";
              }}
              className="px-3 py-2 bg-red-500 text-white rounded"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="bg-white text-black p-4 rounded shadow mb-6">
          <div className="flex gap-3 flex-wrap">
            <input
              placeholder="Search Aadhaar / PAN / Name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="placeholder-blue-700 px-3 py-2 border rounded flex-1"
            />

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 border rounded"
            >
              <option value="">All Status</option>
              <option value="PENDING">PENDING</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>

            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="px-3 py-2 border rounded"
            >
              <option value="">All Stages</option>
              <option value="AADHAAR_UPLOAD">AADHAAR_UPLOAD</option>
              <option value="AADHAAR_OTP">AADHAAR_OTP</option>
              <option value="PAN_UPLOAD">PAN_UPLOAD</option>
              <option value="FACE_MATCH">FACE_MATCH</option>
              <option value="KYC_APPROVAL">KYC_APPROVAL</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>

            <button
              onClick={() => { setPage(1); fetchKycs(); }}
              className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded"
            >
              Apply
            </button>
          </div>
        </div>

        <div className="bg-white text-black rounded shadow overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Aadhaar</th>
                <th className="p-3 text-left">PAN</th>
                <th className="p-3 text-left">Stage</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Face Score</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="p-6 text-center">Loading...</td></tr>
              ) : kycs.length === 0 ? (
                <tr><td colSpan="8" className="p-6 text-center">No records</td></tr>
              ) : (
                kycs.map((k) => (
                  <tr key={k._id} className="border-t">
                    <td className="p-3">{k.userId?.name || "-"}</td>
                    <td className="p-3">{k.userId?.phone || "-"}</td>
                    <td className="p-3">{k.aadhaar?.extractedData?.aadhaarNumber || "-"}</td>
                    <td className="p-3">{k.pan?.extractedData?.panNumber || "-"}</td>
                    <td className="p-3">{k.stage}</td>
                    <td className="p-3">{k.status}</td>
                    <td className="p-3">{k.faceMatch?.score ?? "-"}</td>
                    <td className="p-3">
                      <Link
                        href={`/admin/kycs/${k._id}`}
                        className="px-3 py-1 bg-indigo-600 text-white rounded"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div>Page {page} of {totalPages}</div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="cursor-pointer px-3 py-1 border rounded"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="cursor-pointer px-3 py-1 border rounded"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
