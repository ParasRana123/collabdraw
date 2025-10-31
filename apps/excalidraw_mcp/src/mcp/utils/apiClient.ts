import axios from "axios"

const API_BASE = process.env.API_URL || "http://localhost:3000/api";

export const apiClient = axios.create({
    baseURL: API_BASE,
    timeout: 5000
})