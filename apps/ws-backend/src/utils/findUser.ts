import { WebSocket } from 'ws';

interface User {
    ws: WebSocket;
    userId: number;
    room_id: string[];
}

export default function findUser(users: User[], ws: WebSocket): User | undefined {
    return users.find((user) => user.ws === ws);
}