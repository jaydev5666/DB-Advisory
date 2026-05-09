import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5005";

export const api = {
    login: (username, password) => axios.post(`${API_URL}/login`, { username, password }),
    signup: (username, password) => axios.post(`${API_URL}/signup`, { username, password }),
    googleLogin: (username, name) => axios.post(`${API_URL}/google-login`, { username, name }),
    analyze: (company, deal_type) => axios.post(`${API_URL}/analyze`, { company, deal_type }),
    getHistory: () => axios.get(`${API_URL}/history`),
    downloadPpt: (data) => axios.post(`${API_URL}/download_ppt`, data, { responseType: 'blob' })
};
