import axios from "axios"

const axiosClient =  axios.create({
<<<<<<< HEAD
    baseURL: 'https://algoarena-dsa-coding-platform.onrender.com',
=======
    baseURL: 'http://localhost:5000/',
>>>>>>> 3f69999 (Updated project files)
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});


export default axiosClient;

