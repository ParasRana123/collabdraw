import axios from "axios";
import { HTTP_BACKEND } from "@/config";

export default async function getExistingShapes(roomId: string) {
  const res = await axios.get(`${HTTP_BACKEND}/chat/${roomId}`);
  const messages = res.data.messages;

  const shapes = messages.map((x: { message: string }) => {
    const messageData = JSON.parse(x.message);
    return messageData.shape;
  });

  return shapes;
}