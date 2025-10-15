import express from "express";
import jwt from "jsonwebtoken";
import { middlware } from "./middleware.js";
import { CreateRoomSchema , CreateSignInSchema , CreateUserSchema } from "@repo/common/types";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

app.post("/signup", async (req, res) => {
  const parsedData = CreateUserSchema.safeParse(req.body);
  console.log("parsed");
  console.log(parsedData);
  if (!parsedData.success) {
    console.log("failure");
    console.log(parsedData.error);
    return res.json({
      message: "Incorrect inputs",
    });
  }
  // db-call
  try {
    const user = await prismaClient.user.create({
      data: {
        email: parsedData.data?.username,
        password: parsedData.data.password,
        name: parsedData.data.name,
      },
    });
    res.json({
      userId: user.id,
    });
  } catch (e) {
    res.status(411).json({
      message: "user with this username already exists",
    });
  }
});

app.post("/signin", async (req, res) => {
  const parsedData = CreateSignInSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.json({
      message: "Incorrect inputs",
    });
  }

  const user = await prismaClient.user.findFirst({
    where: {
      email: parsedData.data.username,
      password: parsedData.data.password,
    },
  });

  if (!user) {
    res.status(403).json({
      message: "Not authorised",
    });
    return;
  }

  const token = jwt.sign(
    {
      userId: user?.id,
    },
    JWT_SECRET
  );

  return res.json({
    token,
  });
});

app.post("/room", middlware, async (req, res) => {
  console.log("in room");
  const parsedData = CreateRoomSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.json({
      message: "Incorrect inputs",
    });
  }

  // @ts-ignore
  const userId = req.userId;

  // db-call
  try {
    const room = await prismaClient.room.create({
      data: {
        slug: parsedData.data.name,
        adminId: userId,
      },
    });

    res.json({
      roomId: room.id,
    });
  } catch (e) {
    res.status(411).json({
      message: "Room already exists with this name",
    });
  }
});

app.get("/chat/:roomId" , async (req , res) => {
  const roomId = Number(req.params.roomId);
  const messages = await prismaClient.chat.findMany({
    where: {
      roomId: roomId
    },
    orderBy: {
      id: "desc"
    },
    take: 50,
  });

  res.json({
    messages
  })
})

app.get("/room/:slug" , async (req , res) => {
  const slug = req.params.slug;
  const room = await prismaClient.room.findFirst({
    where: {
      slug
    }
  });

  res.json({
    room
  })
})

app.listen(3001);