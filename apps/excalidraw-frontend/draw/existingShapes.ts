import axios from "axios";
import { HTTP_BACKEND } from "@/config";

export default async function getExistingShapes(roomId: string) {
  console.log("backend exiting shapes: ");
  const res = await axios.get(`${HTTP_BACKEND}/chat/${roomId}`);
  const shapes = res.data.shapes;

  if (!Array.isArray(shapes)) return [];

  const parsedShapes = shapes.map((s: any) => {
    try {
      return JSON.parse(s.shape);
    } catch {
      return null;
    }
  }).filter(Boolean);

  return parsedShapes;
}
