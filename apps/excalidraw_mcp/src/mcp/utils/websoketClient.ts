import WebSocket from "ws";
import { BACKEND_WS_URL , JWT_TOKEN } from "../../config/env.js";

let ws: WebSocket | null = null;

export function connectToBackend() {
    if(ws) return ws;
    ws = new WebSocket(`${BACKEND_WS_URL}?token=${JWT_TOKEN}`);
    ws.on("open" , () => {
        console.log("Connect to the ws drawing backend");
    })
    ws.on("message" , (msg) => {
        console.log("Message: " , msg.toString());
    })
    ws.on("close", () => {
        console.log("[MCP] Disconnected, retrying...");
        setTimeout(connectToBackend, 2000);
    });

    return ws;
}

export function sendToBackend(data: object) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.error("[MCP] WebSocket not ready");
    return;
  }
  ws.send(JSON.stringify(data));
}