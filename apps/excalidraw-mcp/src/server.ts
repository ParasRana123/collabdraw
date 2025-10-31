import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { drawShapeTool } from "./tools/drawShape.js";
import { deleteShapeTool } from "./tools/deleteShape.js";
import { listShapesTool } from "./tools/listShapes.js";
import { z } from "zod";

const server = new McpServer({
    name: "excalidraw-mcp",
    version: "1.0.0"
})

server.tool(
  "draw_shape",
  "Draws a shape in a collaborative room",
  {
    shape_type: z.string().describe("Type of shape to draw (e.g., rect, circle, line)"),
    params: z.object({}).describe("Shape parameters like position, size, and color"),
    roomId: z.string().describe("Unique room ID for collaborative session"),
  },
  async ({ shape_type, params, roomId }) => {
    const result = await drawShapeTool({ shape_type, params, roomId });

    if (!result.success) {
      return {
        content: [{ type: "text", text: `Failed to draw shape: ${result.message}` }],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `Shape '${shape_type}' successfully drawn in room ${roomId}.`,
        },
      ],
    };
  }
);

server.tool(
  "list_shapes",
  "Lists all shapes currently present in a collaborative room",
  {
    roomId: z.string().describe("Unique room ID for the collaborative session"),
  },
  async ({ roomId }) => {
    const result = await listShapesTool({ roomId });

    if (!result.success) {
      return {
        content: [{ type: "text", text: `Failed to list shapes: ${result.message}` }],
      };
    }

    if (!result.shapes || result.shapes.length === 0) {
      return {
        content: [{ type: "text", text: `No shapes found in room ${roomId}.` }],
      };
    }

    const shapesList = result.shapes
      .map((shape: any) => `- ${shape.type} (ID: ${shape.id})`)
      .join("\n");

    return {
      content: [
        {
          type: "text",
          text: `Shapes in room ${roomId}:\n\n${shapesList}`,
        },
      ],
    };
  }
);

export default server;