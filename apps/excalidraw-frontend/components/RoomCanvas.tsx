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

  if (!socket) {
    return <div>Connecting to the server...</div>;
  }

  return (
    <div>
      <button
        style={{
          padding: "8px 16px",
          margin: "0 5px",
          border: "none",
          borderRadius: "20px",
          backgroundColor: shape === "rect" ? "#4CAF50" : "#555",
          color: "white",
          cursor: "pointer",
          transition: "background-color 0.3s",
        }}
        onClick={() => {
          shape !== "rect" ? setShape("rect") : setShape("null");
        }}
      >
        Rectangle
      </button>
      <button
        style={{
          padding: "8px 16px",
          margin: "0 5px",
          border: "none",
          borderRadius: "20px",
          backgroundColor: shape === "circle" ? "#4CAF50" : "#555",
          color: "white",
          cursor: "pointer",
          transition: "background-color 0.3s",
        }}
        onClick={() => {
          shape !== "circle" ? setShape("circle") : setShape("null");
        }}
      >
        Circle
      </button>
      <button
        style={{
          padding: "8px 16px",
          margin: "0 5px",
          border: "none",
          borderRadius: "20px",
          backgroundColor: shape === "line" ? "#4CAF50" : "#555",
          color: "white",
          cursor: "pointer",
          transition: "background-color 0.3s",
        }}
        onClick={() => {
          shape !== "line" ? setShape("line") : setShape("null");
        }}
      >
        Line
      </button>
      <button
        style={{
          padding: "8px 16px",
          margin: "0 5px",
          border: "none",
          borderRadius: "20px",
          backgroundColor: shape === "arrow" ? "#4CAF50" : "#555",
          color: "white",
          cursor: "pointer",
          transition: "background-color 0.3s",
        }}
        onClick={() => {
          shape !== "arrow" ? setShape("arrow") : setShape("null");
        }}
      >
        Arrow
      </button>
      <button
        style={{
          padding: "8px 16px",
          margin: "0 5px",
          border: "none",
          borderRadius: "20px",
          backgroundColor: shape === "oval" ? "#4CAF50" : "#555",
          color: "white",
          cursor: "pointer",
          transition: "background-color 0.3s",
        }}
        onClick={() => {
          shape !== "oval" ? setShape("oval") : setShape("null");
        }}
      >
        Oval
      </button>
      <button
        style={{
          padding: "8px 16px",
          margin: "0 5px",
          border: "none",
          borderRadius: "20px",
          backgroundColor: shape === "text" ? "#4CAF50" : "#555",
          color: "white",
          cursor: "pointer",
          transition: "background-color 0.3s",
        }}
        onClick={() => {
          shape !== "text" ? setShape("text") : setShape("null");
        }}
      >
        Text
      </button>
      <button
        style={{
          padding: "8px 16px",
          margin: "0 5px",
          border: "none",
          borderRadius: "20px",
          backgroundColor: shape === "doodle" ? "#4CAF50" : "#555",
          color: "white",
          cursor: "pointer",
          transition: "background-color 0.3s",
        }}
        onClick={() => {
          shape !== "doodle" ? setShape("doodle") : setShape("null");
        }}
      >
        Doodle
      </button>
      <button
        style={{
          padding: "8px 16px",
          margin: "0 5px",
          border: "none",
          borderRadius: "20px",
          backgroundColor: shape === "rhombus" ? "#4CAF50" : "#555",
          color: "white",
          cursor: "pointer",
          transition: "background-color 0.3s",
        }}
        onClick={() => {
          shape !== "rhombus" ? setShape("rhombus") : setShape("null");
        }}
      >
        Diamond
      </button>
      <button
        style={{
          cursor: "pointer",
          borderRadius: "4px",
          padding: "6px 12px",
          backgroundColor: "#d32f2f",
          color: "white",
          border: "none",
          margin: "0 5px",
        }}
        id="delete-btn"
      >
        Delete
      </button>
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
        <div
          className="menu-item"
          data-action="cut"
          style={{ padding: "8px", cursor: "pointer" }}
        >
          ✂️ Cut
        </div>
        <div
          className="menu-item"
          data-action="copy"
          style={{ padding: "8px", cursor: "pointer" }}
        >
          📋 Copy
        </div>
        <div
          className="menu-item"
          data-action="paste"
          style={{ padding: "8px", cursor: "pointer" }}
        >
          📎 Paste
        </div>
      </div>
      <Canvas roomId={roomId} socket={socket} S_shape={shape} />
    </div>
  );
}