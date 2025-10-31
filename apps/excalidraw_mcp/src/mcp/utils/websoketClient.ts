import WebSocket from "ws";

let ws: WebSocket | null = null;

export function initWebSocketConnection(url: string) {
    ws = new WebSocket(url);
    ws.on("open" , () => {
        console.log("Connect to the ws drawing server");
    })
    ws.on("message" , (msg) => {
        console.log("Message: " , msg.toString());
    })
    ws.on("close" , () => {
        console.log("ws connection closed");
    })
}

export const sendShapeUpdate = (data: any) => {
    if(ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
    } else {
        console.warn("WebSocket not connected. Cannot send shape update.");
    }
}