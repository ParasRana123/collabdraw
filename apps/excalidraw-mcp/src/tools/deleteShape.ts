import { sendToBackend } from "../mcp/utils/websoketClient.js"

export async function deleteShapeTool({ shapeId , roomId } : any) {
    sendToBackend({
        type: "delete_shape",
        shape: JSON.stringify({ id: shapeId }),
        roomId
    });

    return {
        success: true,
        message: `Shape ${shapeId} deleted from room ${roomId}`,
    };
}