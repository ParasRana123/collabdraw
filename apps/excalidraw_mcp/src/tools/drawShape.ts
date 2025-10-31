import { sendToBackend } from "../mcp/utils/websoketClient.js";

export async function drawShapeTool({ shape_type , params , roomId}: any) {
    const shape = {
        type: shape_type,
        ...params
    };

    sendToBackend({
        type: "draw_shape",
        shape,
        roomId
    })

    return {
        success: true,
        message: `shape of the type ${shape_type} drawn in room ${roomId}`
    };
}