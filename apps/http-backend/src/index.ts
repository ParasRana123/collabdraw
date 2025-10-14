import express from "express";
import jwt from "jsonwebtoken";
import { middlware } from "./middleware.js";
import { CreateRoomSchema, CreateSignInSchema, CreateUserSchema } from "@repo/common/types";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";

const app = express();

app.post("/signup", (req, res) => {
  const parsedData = CreateUserSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.json({
      message: "Incorrect inputs",
    });
  }
  // db-call
  prismaClient.user.create({
    data: {
      email: parsedData.data?.username,
      password: parsedData.data.password,
      name: parsedData.data.name
    }
  })
  res.json({
    userId: "123",
  });
});

app.post("/signin", (req, res) => {
  const data = CreateSignInSchema.safeParse(req.body);
  if (!data.success) {
    return res.json({
      message: "Incorrect inputs",
    });
  }
  const userId = 1;
  const token = jwt.sign(
    {
      userId,
    },
    JWT_SECRET
  );

  return res.json({
    token,
  });
});

app.post("/room", middlware, (req, res) => {

  const data = CreateRoomSchema.safeParse(req.body);
  if (!data.success) {
    return res.json({
      message: "Incorrect inputs",
    });
  }
  // db-call

  res.json({
    roomId: "123",
  });
});

app.listen(3000);