import { WebSocket } from "ws";

interface User {
  ws: WebSocket;
  rooms: string[];
  userId: string;
}

export default function findUser(users: User[] , ws: WebSocket) : User | undefined {
    return users.find((x) => x.ws === ws);
}