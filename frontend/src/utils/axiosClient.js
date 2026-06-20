import axios from "axios";

const axiosClient = axios.create({
    baseURL: "https://algoarena-dsa-coding-platform.onrender.com",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
    console.log("API URL =", "https://algoarena-dsa-coding-platform.onrender.com");
});

export default axiosClient;
