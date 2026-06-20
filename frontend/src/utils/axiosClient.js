

import axios from "axios";

const axiosClient = axios.create({
  baseURL: "https://algoarena-dsa-coding-platform.onrender.com",
  withCredentials: true,
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default axiosClient; 