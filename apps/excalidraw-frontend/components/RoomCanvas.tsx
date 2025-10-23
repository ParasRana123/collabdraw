"use client";

import { useEffect , useRef , useState } from "react";
import { WS_URL } from "@/config";
import { Canvas } from "./Canvas";

export function RoomCanvas({ roomId } : {roomId: string}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [socket , setSocket] = useState<WebSocket | null>(null);
    const [shape , setShape] = useState("null");

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
        <button style={{
                padding: '8px 16px',
                margin: '0 5px',
                border: 'none',
                borderRadius: '20px',
                backgroundColor: shape === "rect" ? '#4CAF50' : '#555',
                color: 'white',
                cursor: 'pointer',
                transition: 'background-color 0.3s'
        }} onClick={() => { (shape !== "rect")? setShape("rect") : setShape("null")}}>Rectangle</button>
        <button style={{
                padding: '8px 16px',
                margin: '0 5px',
                border: 'none',
                borderRadius: '20px',
                backgroundColor: shape === "circle" ? '#4CAF50' : '#555',
                color: 'white',
                cursor: 'pointer',
                transition: 'background-color 0.3s'
        }} onClick={() => { (shape !== "circle")? setShape("circle") : setShape("null")}}>Circle</button>
        <Canvas roomId={roomId} socket={socket} S_shape={shape} />
    </div>
}