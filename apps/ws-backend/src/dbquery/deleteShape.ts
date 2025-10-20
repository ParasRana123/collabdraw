import { prismaClient } from "@repo/db/client";

export default async function deleteShape(id: number) {
    console.log("delcting shape: " , id);
    const res = await prismaClient.shape.delete({
        where: {
            id: id
        }
    });

    return res;
}