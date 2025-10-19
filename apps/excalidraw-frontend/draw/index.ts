import axios from "axios";
import { HTTP_BACKEND } from "@/config";

type Shape =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
    }
  | {
    type: "line";
    x1: number;
    y1: number;
    x2: number;
    y2: number
    }
  | {
    type: "point";
    x: number;
    y: number;
  };

export async function initDraw(
  canvas: HTMLCanvasElement,
  roomId: string,
  socket: WebSocket,
  shapeType: "rect" | "circle" | "line" | "point"
) {
  const ctx = canvas.getContext("2d");

  let existingShapes: Shape[] = await getExistingShapes(roomId);
  if (!ctx) {
    return;
  }

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);

    if (message.type == "chat") {
      const parsedShape = JSON.parse(message.message);
      existingShapes.push(parsedShape.shape);
      clearCanvas(existingShapes, canvas, ctx);
    }

    console.log("going");

    if (message.type == "stream_shape") {
      console.log("in stream fe");
      const shape = message.shape;
      clearCanvas(existingShapes, canvas, ctx);
      ctx.strokeStyle = "rgba(255 , 255 , 255)";
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      console.log("out stream fe");
    }

    console.log("going1");
  };

  clearCanvas(existingShapes, canvas, ctx);

  let clicked = false;
  let startX = 0;
  let startY = 0;

  canvas.addEventListener("mousedown", (e) => {
    clicked = true;
    console.log("mouse down trigger");
    startX = e.clientX;
    startY = e.clientY;
  });

  canvas.addEventListener("mouseup", (e) => {
    clicked = false;
    console.log("mouse up trigger");
    const width = e.clientX - startX;
    const height = e.clientY - startY;
    const shape: Shape = {
      type: "rect",
      x: startX,
      y: startY,
      height,
      width,
    };

    existingShapes.push(shape);

    socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({
          shape,
        }),
        roomId,
      })
    );
  });

  canvas.addEventListener("mousemove", (e) => {
    console.log("mouse move trigger");
    const currentX = e.offsetX;
    const currentY = e.offsetY;

    let shape: Shape;

    if (clicked) {
      const width = e.clientX - startX;
      const height = e.clientY - startY;
      clearCanvas(existingShapes, canvas, ctx);
      ctx.strokeStyle = "rgba(255 , 255 , 255)";

      if (shapeType == "rect") {

        shape = {
          type: "rect",
          x: startX,
          y: startY,
          width,
          height
        }

        ctx?.strokeRect(startX, startY, width, height);

      } else if(shapeType == "circle") {
        const centerX = startX + width / 2;
        const centerY = startY + height / 2;
        const radius = Math.max(Math.abs(width) , Math.abs(height)) / 2;

        shape = {
          type: 'circle',
          centerX,
          centerY,
          radius
        }

      } else if(shapeType == "line") {

        shape = {
          type: "line",
          x1: startX,
          y1: startY,
          x2: currentX,
          y2: currentY
        }

      } else {
        return;
      }

      drawShape(ctx , shape);

      socket.send(
          JSON.stringify({
            type: "stream_shape",
            shape: shape,
            roomId,
          })
      );

    }
  });
}

function drawShape(ctx: CanvasRenderingContext2D , shape: Shape) {
  ctx.strokeStyle = "white";

  if(shape.type === "rect") {
    ctx?.strokeRect(shape.x, shape.y, shape.width, shape.height);

  } else if(shape.type === "circle") {
    ctx.beginPath();
    ctx.arc(shape.centerX , shape.centerY , shape.radius , 0 , Math.PI * 2);
    ctx.stroke();
    ctx.closePath();

  } else if(shape.type === "line") {
    ctx.beginPath();
    ctx.moveTo(shape.x1 , shape.y1);
    ctx.lineTo(shape.x2 , shape.y2);
    ctx.stroke();

  } else if(shape.type === "point") {
    ctx.beginPath();
    ctx.arc(shape.x, shape.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();

  }
}

function clearCanvas(
  existingShapes: Shape[],
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) {
  ctx?.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0 , 0 , 0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  existingShapes.map((shape) => {
    if (shape.type == "rect") {
      ctx.strokeStyle = "rgba(255 , 255 , 255)";
      ctx?.strokeRect(shape.x, shape.y, shape.width, shape.height);
    }
  });
}

async function getExistingShapes(roomId: string) {
  const res = await axios.get(`${HTTP_BACKEND}/chat/${roomId}`);
  const messages = res.data.messages;

  const shapes = messages.map((x: { message: string }) => {
    const messageData = JSON.parse(x.message);
    return messageData.shape;
  });

  return shapes;
}
