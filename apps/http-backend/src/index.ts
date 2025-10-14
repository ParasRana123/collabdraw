import express from "express";
import jwt from "jsonwebtoken";
import { middlware } from "./middleware";
import { JWT_SECRET } from "../../../packages/backend-common/config";

const app = express();

app.post("/signup" , (req , res) => {
    // db-call
})

app.post("/signin" , (req , res) => {

    const userId = 1;
    const token = jwt.sign({
        userId
    } , JWT_SECRET);

    return res.json({
        token
    })
})

app.post("/room" , middlware , (req , res) => {
    // db-call

    res.json({
        roomId: "123"
    })
})

app.listen(3000);