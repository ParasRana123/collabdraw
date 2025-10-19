import WebSocket, { WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import createShape from "./dbquery/createShape.js";
import { prismaClient } from "@repo/db/client";

const wss = new WebSocketServer({ port: 8080 });

// state management schema: using global array
// const users = [{
//   userId: "1",
//   rooms: ["room1" , "room2"],
//   socket: "ws1"
// } , {
//   userId: "2",
//   rooms: ["room1"],
//   socket: "ws2"
// } , {
//   userId: "1",
//   rooms: ["room2" , "room3"],
//   socket: "ws3"
// }]

interface User {
  ws: WebSocket;
  rooms: string[];
  userId: string;
}

const users: User[] = [];

function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded == "string") {
      return null;
    }

    if (!decoded || !decoded.userId) {
      return null;
    }

    return decoded.userId;
  } catch (e) {
    console.error("JWT verification failed:", e);
    return null;
  }
}

wss.on("connection", function connection(ws, request) {
  const url = request.url;
  if (!url) {
    return;
  }
  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") || "";
  const userId = checkUser(token);

  if (userId == null) {
    ws.close();
    return null;
  }

  users.push({
    userId,
    rooms: [],
    ws,
  });

  // {
  //   type: "join_room",
  //   roomId: 1,
  // }

  ws.on("message", async function message(data) {
    const parsedData = JSON.parse(data as unknown as string);

    if (parsedData.type == "join_room") {
      const user = users.find((x) => x.ws === ws);
      user?.rooms.push(parsedData.roomId);
    }

    if (parsedData.type == "leave_room") {
      const user = users.find((x) => x.ws === ws);
      if (!user) {
        return;
      }
      user.rooms = user?.rooms.filter((x) => x === parsedData.room);
    }

    if(parsedData.type == "stream_shape") {
      const shape = parsedData.shape;
      const roomId = parsedData.roomId;

      console.log("stream be1");
      users.forEach((user) => {
        if(user.rooms.includes(String(roomId))) {
          user.ws.send(
            JSON.stringify({
              type: "stream_shape",
              shape,
              roomId
            })
          )
        }
      })

      console.log("stream be2");
    }

    if (parsedData.type == "draw_shape") {
      let shape = parsedData.shape;
      const roomId = parsedData.roomId;
      const userId =  checkUser(token);
      console.log("shape shape =", shape);

      console.log("in db");
      const res = await createShape(shape , roomId , Number(userId));
      console.log("data1" , res);

      console.log("in brodacsting");
      users.forEach((user) => {
        if (user.rooms.includes(parsedData.roomId)) {
          user.ws.send(
            JSON.stringify({
              type: "draw_shape",
              shape: `${shape}`,
              roomId,
              id: res.id
            })
          );
          console.log("brodcasted");
        } else {
          console.log("error");
        }
      });
      console.log("out brodacsting");
    }
  });
});