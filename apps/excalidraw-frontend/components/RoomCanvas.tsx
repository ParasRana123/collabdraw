"use client";

import { useEffect, useRef, useState } from "react";
import { WS_URL } from "@/config";
import { Canvas } from "./Canvas";

export function RoomCanvas({ roomId }: { roomId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [shape, setShape] = useState("null");

  useEffect(() => {
    const ws = new WebSocket(
      `${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImlhdCI6MTc2MTQyMDE2OH0.ltA6f4St0jjHwuOAjZSGelr5JuBlzfAU9ycO9QuB9l4`
    );

    ws.onopen = () => {
      setSocket(ws);
      ws.send(
        JSON.stringify({
          type: "join_room",
          roomId,
        })
      );
    };
  }, []);

  const buttonStyle = (isActive: boolean) => ({
    padding: "10px",
    margin: "0 2px",
    border: isActive ? "2px solid #6965db" : "1px solid #e9ecef",
    borderRadius: "6px",
    backgroundColor: isActive ? "#f5f5ff" : "white",
    color: "#1e1e1e",
    cursor: "pointer",
    transition: "all 0.2s",
    fontSize: "18px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "40px",
    height: "40px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  });

  if (!socket) {
    return <div>Connecting to the server...</div>;
  }

  return (
    <div>
      <div
        style={{
          padding: "10px 16px",
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #e9ecef",
          display: "flex",
          justifyContent: "center", 
          alignItems: "center",
          gap: "6px",
          height: "60px",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        }}
      >
        <button
          style={buttonStyle(shape === "rect")}
          onClick={() => setShape(shape !== "rect" ? "rect" : "null")}
          title="Rectangle"
        >
          ▭
        </button>
        <button
          style={buttonStyle(shape === "circle")}
          onClick={() => setShape(shape !== "circle" ? "circle" : "null")}
          title="Circle"
        >
          ○
        </button>
        <button
          style={buttonStyle(shape === "line")}
          onClick={() => setShape(shape !== "line" ? "line" : "null")}
          title="Line"
        >
          ╱
        </button>
        <button
          style={buttonStyle(shape === "arrow")}
          onClick={() => setShape(shape !== "arrow" ? "arrow" : "null")}
          title="Arrow"
        >
          →
        </button>
        <button
          style={buttonStyle(shape === "oval")}
          onClick={() => setShape(shape !== "oval" ? "oval" : "null")}
          title="Oval"
        >
          ⬭
        </button>
        <button
          style={buttonStyle(shape === "text")}
          onClick={() => setShape(shape !== "text" ? "text" : "null")}
          title="Text"
        >
          T
        </button>
        <button
          style={buttonStyle(shape === "doodle")}
          onClick={() => setShape(shape !== "doodle" ? "doodle" : "null")}
          title="Draw"
        >
          ✎
        </button>
        <button
          style={buttonStyle(shape === "rhombus")}
          onClick={() => setShape(shape !== "rhombus" ? "rhombus" : "null")}
          title="Diamond"
        >
          ◇
        </button>

        <div
          style={{
            width: "1px",
            height: "30px",
            backgroundColor: "#e9ecef",
            margin: "0 8px",
          }}
        />

        <button
          style={{
            ...buttonStyle(false),
            backgroundColor: "#ff6b6b",
            color: "white",
            border: "1px solid #ff5252",
          }}
          id="delete-btn"
          title="Delete"
        >
          🗑
        </button>
      </div>

      <div
        id="context-menu"
        style={{
          position: "absolute",
          display: "none",
          background: "#222",
          color: "white",
          border: "1px solid #444",
          borderRadius: "6px",
          fontFamily: "sans-serif",
          zIndex: 1000,
          width: "120px",
        }}
      >
        <div className="menu-item" data-action="cut" style={{ padding: "8px", cursor: "pointer" }}>
          ✂️ Cut
        </div>
        <div className="menu-item" data-action="copy" style={{ padding: "8px", cursor: "pointer" }}>
          📋 Copy
        </div>
        <div className="menu-item" data-action="paste" style={{ padding: "8px", cursor: "pointer" }}>
          📎 Paste
        </div>
      </div>

      <Canvas roomId={roomId} socket={socket} S_shape={shape} />
    </div>
  );
}