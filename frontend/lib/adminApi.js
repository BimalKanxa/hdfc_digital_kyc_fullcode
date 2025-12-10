// frontend/lib/adminApi.js
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL;

export function getAdminToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("adminToken");
}

export function adminAxios() {
  const token = getAdminToken();
  const instance = axios.create({
    baseURL: API,
    headers: token ? { Authorization: token } : {},
  });
  return instance;
}
