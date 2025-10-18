import { initDraw } from "@/draw";
import { useEffect , useRef, useState } from "react";
import { IconButton } from "./IconButton";
import { Circle, Pencil, RectangleHorizontalIcon } from "lucide-react";

type Shape = "circle" | "rect" | "line" | "point";

export function Canvas({ roomId , socket } : {roomId: string , socket: WebSocket}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedShape , setSelectedShape] = useState<Shape>("circle");

    useEffect(() => {
        if(canvasRef.current) {
            initDraw(canvasRef.current , roomId , socket , selectedShape);
        }
    } , [ canvasRef , selectedShape ])

    return <div>

        <button className={`px-3 py-1 ${selectedShape === "rect" ? "text-red-500" : "text-black"}`} onClick={() => {
            setSelectedShape("rect");

        }}>Rectangle</button>
        <button className={`px-3 py-1  ${selectedShape === "circle" ? "text-red-500" : "text-black"}`} onClick={() => {
            setSelectedShape("circle");
        }}>Circle</button>
        <button className={`px-3 py-1  ${selectedShape === "line" ? "text-red-500" : "text-black"}`} onClick={() => {
            setSelectedShape("line");
        }}>Line</button>
        <button className={`px-3 py-1  ${selectedShape === "point" ? "text-red-500" : "text-black"}`} onClick={() => {
            setSelectedShape("point");
        }}>Point</button>

        <canvas ref={canvasRef} width={2000} height={1080}></canvas>
    </div>
}