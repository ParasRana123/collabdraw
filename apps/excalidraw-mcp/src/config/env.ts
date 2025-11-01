import dotenv from "dotenv";
dotenv.config({ override: true, debug: false });


export const BACKEND_WS_URL = process.env.WS_URL || "ws://localhost:8080";
export const BACKEND_API_URL = process.env.HTTP_URL || "http://localhost:3002";
export const JWT_TOKEN = process.env.JWT_TOKEN || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImlhdCI6MTc2MjAyMTMwNH0.-lKfeHPLxYPy2NpRLr2Wz0f6uak9qKhmYUYAwn7gLD8";