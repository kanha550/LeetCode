import axios from "axios"

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://leetcode-1019.onrender.com',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default axiosClient;
