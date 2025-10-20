import { Tool } from "@/components/Canvas";
import getExistingShapes from "./existingShapes";

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes = Shape[];
    private roomId: string;
    private socket: WebSocket;
    private clicked: boolean;
    private startX: number = 0;
    private startY: number = 0;
    private selectedTool: Tool = "circle"; 

    constructor(canvas: HTMLCanvasElement , roomId: string , socket: WebSocket) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.roomId = roomId;
        this.socket = socket;
        this.existingShapes = [];
        this.clicked = false;
        this.init();
        this.initHandlers();
        this.initMouseHandlers();
    }

    setShape(tool: "circle" | "pencil" | "rect") {
        this.selectedTool = tool;
    }

    async init() {
        this.existingShapes = await getExistingShapes(this.roomId);
    }

    initHandlers() {
        this.socket.onmessage =(event) => {
            const message = JSON.parse(event.data);

            if(message.type == "chat") {
                const parsedShape = JSON.parse(message.message);
                this.existingShapes.push(parsedShape.shape);
                this.clearCanvas(this.existingShapes, this.canvas , this.ctx);
            }
        }
    }

    clearCanvas() {
        this.ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "rgba(0 , 0 , 0)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.existingShapes.map((shape) => {
            if (shape.type === "rect") {
                this.ctx.strokeStyle = "rgba(255 , 255 , 255)";
                this.ctx?.strokeRect(shape.x, shape.y, shape.width, shape.height);
            } else if(shape.type === "circle") {
                this.ctx.beginPath();
            }
        });
    }

    initMouseHandlers() {
        this.canvas.addEventListener("mousedown", (e) => {
            this.clicked = true;
            console.log("mouse down trigger");
            this.startX = e.clientX;
            this.startY = e.clientY;
        });

        this.canvas.addEventListener("mouseup", (e) => {
    this.clicked = false;
    console.log("mouse up trigger");
    const width = e.clientX - this.startX;
    const height = e.clientY - this.startY;
    const currentX = e.offsetX;
    const currentY = e.offsetY;

    let shape: Shape;

    if(shapeType === "rect") {
      shape = {
        type: "rect",
        x: this.startX,
        y: this.startY,
        width,
        height
      };
    } else if(shapeType === "circle") {
        const centerX = this.startX + width / 2;
        const centerY = this.startY + height / 2;
        const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
        shape = {
          type: "circle",
          centerX,
          centerY,
          radius
        };
    } else if(shapeType === "line") {
        shape = {
        type: "line",
        x1: this.startX,
        y1: this.startY,
        x2: currentX,
        y2: currentY,
      };
    } else {
      return;
    }

    this.existingShapes.push(shape);

    this.socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({
          shape,
        }),
        roomId: this.roomId,
      })
    );
  });

  this.canvas.addEventListener("mousemove", (e) => {
    console.log("mouse move trigger");
    const currentX = e.offsetX;
    const currentY = e.offsetY;

    let shape: Shape;

    if (this.clicked) {
      const width = e.clientX - this.startX;
      const height = e.clientY - this.startY;
      this.clearCanvas();
      this.ctx.strokeStyle = "rgba(255 , 255 , 255)";

      if (shapeType == "rect") {

        shape = {
          type: "rect",
          x: this.startX,
          y: this.startY,
          width,
          height
        }

        this.ctx?.strokeRect(this.startX, this.startY, width, height);

      } else if(shapeType == "circle") {
        const centerX = this.startX + width / 2;
        const centerY = this.startY + height / 2;
        const radius = Math.max(Math.abs(width) , Math.abs(height)) / 2;

        shape = {
          type: 'circle',
          centerX,
          centerY,
          radius
        }

        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.closePath();

      } else if(shapeType == "line") {

        shape = {
          type: "line",
          x1: this.startX,
          y1: this.startY,
          x2: currentX,
          y2: currentY
        }

        this.ctx.beginPath();
        this.ctx.moveTo(this.startX , this.startY);
        this.ctx.lineTo(currentX , currentY);
        this.ctx.stroke();

      } else {
        return;
      }

      this.socket.send(
          JSON.stringify({
            type: "stream_shape",
            shape: shape,
            roomId: this.roomId,
          })
      );
    }
  });
    }
}