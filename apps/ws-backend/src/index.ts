import WebSocket, { WebSocketServer } from "ws";
import createShape from "./dbquery/createShape.js";
import deleteShape from "./dbquery/deleteShape.js";
import { prismaClient } from "@repo/db/client";
import findUser from "./utils/findUser.js";
import verifyToken from "./utils/verfifyToken.js";

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

wss.on("connection", function connection(ws, request) {
  const url = request.url;
  if (!url) {
    return;
  }
  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") || "";
  const userId = verifyToken(token);
  console.log("Verified userId: " , userId);

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
      const user = findUser(users , ws);
      user?.rooms.push(parsedData.roomId);
    }

    if (parsedData.type == "leave_room") {
      const user = findUser(users , ws);
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
      const userId =  verifyToken(token);
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

    if(parsedData.type === "delete_shape") {
      const shape = JSON.parse(parsedData.shape);
      console.log("shape: " , shape);
      const room_id = parsedData.roomId;
      const user = findUser(users , ws);
      if(!user?.rooms.includes(room_id)) {
        console.log("user not in room");
        return;
      }
      const shapeToDelete = await prismaClient.shape.findFirst({
        where: {
          id: shape.id
        }
      });
      console.log("shape to delete: " , shapeToDelete);
      if(shapeToDelete) {
        const res = await deleteShape(shapeToDelete.id);
        console.log("delete res = " , res);
      }
      users.forEach((user) => {
        if(user.rooms.includes(room_id)) {
          user.ws.send(JSON.stringify({
            type: "delete_shape",
            id: shape.id,
            room_id: room_id
          }))
        }
      })
    }
  });
});