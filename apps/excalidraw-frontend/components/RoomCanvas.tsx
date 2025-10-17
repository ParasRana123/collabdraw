"use client";

import { useEffect , useRef , useState } from "react";
import { WS_URL } from "@/config";
import { Canvas } from "./Canvas";

export function RoomCanvas({ roomId } : {roomId: string}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [socket , setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkZTIyMTU5NS0wNTBlLTQ2N2UtODVhMS00NzNhMDA5MzliMWQiLCJpYXQiOjE3NjA3MjA3Mzl9.C9zPXmzY6DnyZ0O37RJzEI9VVEkp7I4Qe6h308apVmw`);
        
        ws.onopen = () => {
            setSocket(ws);
            ws.send(JSON.stringify({
                type: "join_room",
                roomId
            }))
        }
    })

    if(!socket) {
        return <div>
            Connecting to the server...
        </div>
    }

    return <div>
        <Canvas roomId={roomId} socket={socket}/>
    </div>
}