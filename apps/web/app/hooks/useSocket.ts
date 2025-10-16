import { useEffect , useState } from "react";
import { WS_URL } from "../config";

export function useSocket() {
    const [loading , setLoading] = useState(true);
    const [socket , setSocket] = useState<WebSocket>();

    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxNzVjMjZjOS1hNzYxLTRiODUtYTFiMi0wODdmMmM0NTNiNWEiLCJpYXQiOjE3NjA1NDM1MTl9.F-0_ull05Y9kcHK8U8R5c43NM2bEuPtI1ITYUZLxlbY`);
        ws.onopen = () => {
            setLoading(false);
            setSocket(ws);
        }
    } , []);

    return {
        socket,
        loading
    }
}