import { useEffect , useRef, useState } from "react";
import { Game } from "@/draw/Game";
import { useWindowSize } from "@uidotdev/usehooks";

export function Canvas({ roomId , socket , S_shape } : {roomId: string , socket: WebSocket , S_shape: string}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [game , setGame] = useState<Game | null>();
    const size = useWindowSize()

    useEffect(() => {
        game?.setShape(S_shape);
    } , [game , S_shape])

    useEffect(() => {
        if(canvasRef.current) {
            const canvas = canvasRef.current;
            const g = new Game(canvas , S_shape , roomId , socket);
            setGame(g);
        }
    } , [ canvasRef , size ])

    return (
        <canvas ref={canvasRef} width={size.width ?? window.innerWidth} height={size.height ?? window.innerHeight}></canvas>
    )
}