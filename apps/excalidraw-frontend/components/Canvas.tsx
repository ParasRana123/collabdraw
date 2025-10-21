import { initDraw } from "@/draw";
import { useEffect , useRef, useState } from "react";
import { IconButton } from "./IconButton";
import { Circle, Pencil, RectangleHorizontalIcon } from "lucide-react";
import { Game } from "@/draw/Game";

export type Tool = "circle" | "rect" | "pencil" | "point";

export function Canvas({ roomId , socket } : {roomId: string , socket: WebSocket}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [game , setGame] = useState<Game>();
    const [selectedTool , setSelectedTool] = useState<Tool>("circle");

    useEffect(() => {
        game.setTool(selectedTool);
    } , [selectedTool , game])

    useEffect(() => {
        if(canvasRef.current) {
            const g = new Game(canvasRef.current , roomId , socket);
            setGame(g);
        }
    } , [ canvasRef , selectedTool ])

    return <div>

        <button className={`px-3 py-1 ${selectedTool === "rect" ? "text-red-500" : "text-black"}`} onClick={() => {
            setSelectedTool("rect");

        }}>Rectangle</button>
        <button className={`px-3 py-1  ${selectedTool === "circle" ? "text-red-500" : "text-black"}`} onClick={() => {
            setSelectedTool("circle");
        }}>Circle</button>
        <button className={`px-3 py-1  ${selectedTool === "line" ? "text-red-500" : "text-black"}`} onClick={() => {
            setSelectedTool("line");
        }}>Line</button>
        <button className={`px-3 py-1  ${selectedTool === "point" ? "text-red-500" : "text-black"}`} onClick={() => {
            setSelectedTool("point");
        }}>Point</button>

        <canvas ref={canvasRef} width={2000} height={1080}></canvas>
    </div>
}