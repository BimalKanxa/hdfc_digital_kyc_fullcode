"use client";

import React, { useState } from "react";
import axios from "axios";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const res = await axios.post(`${API}/api/admin/login`, {
        username,
        password,
      });

      const token = res.data.token;
      localStorage.setItem("adminToken", token);
      setMsg("Login successful. Redirecting...");
      setTimeout(() => (window.location.href = "/admin/kycs"), 700);
    } catch (err) {
      console.error(err);
      setMsg(err.response?.data?.message || "Login failed");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-4 text-center text-black">Admin Login</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            className="w-full p-3 border rounded text-black placeholder-gray-400"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            className="w-full p-3 border rounded text-black placeholder-gray-400"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="cursor-pointer w-full bg-blue-600 text-white py-3 rounded font-semibold"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {msg && <p className="mt-4 text-center text-red-600">{msg}</p>}
      </div>
    </div>
  );
}
