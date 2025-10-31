import dotenv from "dotenv";
dotenv.config();

export const BACKEND_WS_URL = process.env.WS_URL || "ws://localhost:8080";
export const BACKEND_API_URL = process.env.HTTP_URL || "http://localhost:3002";
export const JWT_TOKEN = process.env.JWT_TOKEN || "your-jwt";