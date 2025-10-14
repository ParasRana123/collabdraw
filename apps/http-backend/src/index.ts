import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config";

const app = express();

app.post("/signup" , (req , res) => {

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

app.post("/room" , (req , res) => {

})

app.listen(3000);