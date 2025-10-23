import { prismaClient } from "@repo/db/client";

export default async function createShape(shape: any , room_id: string , user_id: number) {
    const res = await prismaClient.shape.create({
        data: {
            shape: `${shape}`,
            roomId: parseInt(room_id),
            userId: user_id,
        }
    });
    return res;
}