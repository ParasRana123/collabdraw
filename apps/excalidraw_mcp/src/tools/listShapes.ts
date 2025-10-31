import axios from "axios";
import { BACKEND_API_URL } from "../config/env.js";

export async function listShapesTool({ roomId }: any) {
  const res = await axios.get(`${BACKEND_API_URL}/chat/${roomId}`);
  return res.data.shapes;
}