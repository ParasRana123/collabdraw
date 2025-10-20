import { JWT_SECRET } from "@repo/backend-common/config";
import jwt from "jsonwebtoken";


export default function verifyToken(token: string) : string | null {
    try {
        const decoded = jwt.verify(token , JWT_SECRET);
        if(typeof decoded == "string") {
            return null;
        }

        if(!decoded || !decoded.userId) {
            return null;
        }
        return decoded.userId;
    } catch(error) {
        console.log("JWT Verfiication failed: " , error);
        return null;
    }
}