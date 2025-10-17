"use client";

import { useEffect , useRef , useState } from "react";
import { WS_URL } from "@/config";
import { Canvas } from "./Canvas";

export function RoomCanvas({ roomId } : {roomId: string}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [socket , setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(WS_URL);
        
        ws.onopen = () => {
            setSocket(ws);
        }
    })

    if(!socket) {
        return <div>
            Connecting to the server...
        </div>
    }

    return <div>
        <Canvas roomId={roomId}/>
    </div>
}