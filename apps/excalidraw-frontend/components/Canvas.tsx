import { initDraw } from "@/draw";
import { useEffect , useRef, useState } from "react";

export function Canvas({ roomId , socket } : {roomId: string , socket: WebSocket}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedShape , setSelectedShape] = useState<"rect" | "circle" | "line" | "point">("rect");

    useEffect(() => {
        if(canvasRef.current) {
            console.log(selectedShape);
            initDraw(canvasRef.current , roomId , socket , selectedShape);
        }
    } , [canvasRef , selectedShape])

    return <div>
        <button className="px-3 py-1 text-black" onClick={() => {
            setSelectedShape("rect");
        }}>Rectangle</button>
        <button className="px-3 py-1 text-black" onClick={() => {
            setSelectedShape("circle");
        }}>Circle</button>
        <button className="px-3 py-1 text-black" onClick={() => {
            setSelectedShape("line");
        }}>Line</button>
        <button className="px-3 py-1 text-black" onClick={() => {
            setSelectedShape("point");
        }}>Point</button>
        <canvas ref={canvasRef} width={2000} height={1000}></canvas>
    </div>
}