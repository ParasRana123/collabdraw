interface Rectangle {
  type: "rect";
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Circle {
  type: "circle";
  x: number;
  y: number;
  radius: number;
}

type Shape = any;
let Shape: Shape[] = [];

export async function initDraw(canvas: HTMLCanvasElement, shape: string , roomId: string, socket: WebSocket, ExistingShape: any) {
  const ctx = canvas.getContext("2d");
  console.log("Existing shape: " , ExistingShape)
  if (!ctx) {
    return;
  }
  if(Array.isArray(ExistingShape)) {
    ExistingShape.map((item: any) => {
      console.log("Existing shape item: " , item);
    });
  } else {
    console.log("Existing shape" , ExistingShape);
  }

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type === "draw_shape") {
      const parsedShape = JSON.parse(message.shape);
      Shape.push(parsedShape);
      console.log("Shape from socket: " , Shape); 
      clearCanvas(Shape, canvas, ctx);
    }
  }

  let clicked = false;
  let startX = 0;
  let startY = 0;
  let width = 0;
  let height = 0;

  const handleMouseDown = (e: MouseEvent) => {
      clicked = true;
      console.log("mouse down trigger");
      startX = e.clientX;
      startY = e.clientY;
  }

  const handleMouseUp = (e: MouseEvent) => {
    clicked = false;
    if(shape === "rect") {
      Shape.push({
        type: "rect",
        x: startX,
        y: startY,
        width: width,
        height: height,
      })
      socket.send(JSON.stringify({
                "type": "draw_shape",
                "room_id": roomId,
                "shape": `{ "x": ${startX}, "y": ${startY}, "width": ${width}, "height": ${height}, "type": "rect" }`
      }));
    } else if(shape === "circle") {
      Shape.push({
        type: "circle",
        x: startX,
        y: startY,
        radius: Math.sqrt(width * width + height * height)
      })
      socket.send(JSON.stringify({
                "type": "draw_shape",
                "room_id": roomId,
                "shape": `{ "x": ${startX}, "y": ${startY}, "radius": ${Math.sqrt(width * width + height * height)}, "type": "circle" }`
      }));
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if(clicked) {
      width = e.clientX - startX;
      height = e.clientY - startY;
      if(shape === "rect") {
        ctx.strokeStyle = "white";
        ctx.strokeRect(startX , startY , width , height);
      } else if(shape === "circle") {
        ctx.strokeStyle = "white";
        ctx.beginPath();
        ctx.arc(startX , startY , Math.sqrt(width * width + height * height) , 0 , 2 * Math.PI);
        ctx.stroke();
        ctx.closePath();
      }
    }
  }
}

export default function clearCanvas(Shape: Shape[], canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  ctx?.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0 , 0 , 0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  Shape.map((shape) => {
    if (shape.type === "rect") {
      ctx.strokeStyle = "rgba(255 , 255 , 255)";
      ctx?.strokeRect(shape.x, shape.y, shape.width, shape.height);
    } else if(shape.type === "circle") {
      ctx.beginPath();
    }
  });
}