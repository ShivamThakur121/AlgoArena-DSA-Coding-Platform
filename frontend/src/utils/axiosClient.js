import axios from "axios";

const axiosClient = axios.create({
    baseURL: "https://algoarena-dsa-coding-platform.onrender.com",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
});

export default axiosClient;
