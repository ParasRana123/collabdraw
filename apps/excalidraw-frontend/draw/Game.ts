import getExistingShapes from "./existingShapes";

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private Shape: any[] = [];
    private roomId: string;
    private socket: WebSocket;
    private clicked: boolean;
    private startX: number = 0;
    private startY: number = 0;
    private S_shape: string;
    private width: number = 0;
    private height: number = 0;
    private radius: number = 5;
    private selectedShapes: any[] = [];

    constructor(canvas: HTMLCanvasElement, S_shape: string, roomId: string , socket: WebSocket) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.roomId = roomId;
        this.socket = socket;
        this.S_shape = S_shape;
        this.clicked = false;
        if(this.ctx) {
            this.fetchShapes();
            this.init();
            this.initHandlers();
        }
    }


    async fetchShapes() {
        console.log("Fetching shapes: ");
        const shapes = await getExistingShapes(this.roomId);
        this.Shape = shapes;
        this.drawShape();
    }

    setShape(shape: string) {
        console.log("Setting shape", shape);
        this.S_shape = shape;
        if (this.selectedShapes.length > 0) {
            console.log("Selected shapes length", this.selectedShapes.length);
            this.selectedShapes.forEach((item) => {
                this.Shape[item.index].color = item.prevColor;
                console.log("Shape after setting color", this.Shape[item.index]);
            });
            this.selectedShapes = [];
            this.drawShape();
        }
    }

    init() {
        this.socket.onmessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            console.log(data);
            if(data.type === "draw_shape") {
                let shape = JSON.parse(data.shape);
                shape.id = data.id;
                this.Shape.push(shape);
                this.drawShape();
            }
        }
    }

    initHandlers() {
        this.canvas.addEventListener("mousedown" , this.handleMouseDown);
        this.canvas.addEventListener("mousemove" , this.handleMouseMove);
        this.canvas.addEventListener("mouseup" , this.handleMouseUp);
    }

    handleMouseDown = (e: MouseEvent) => {
        console.log("mouse down trigger");
        this.clicked = true;
        this.startX = e.clientX;
        this.startY = e.clientY;
    }

    handleMouseMove = (e: MouseEvent) => {
        console.log("mouse move trigger");
        if(this.clicked) {
            this.width = e.clientX - this.startX;
            this.height = e.clientY - this.startY;
            this.drawShape();
            if(this.S_shape === "rect") {
                this.ctx.strokeStyle = "white";
                this.ctx.strokeRect(this.startX , this.startY , this.width , this.height);
            } else if(this.S_shape === "circle") {
                this.ctx.beginPath();
                this.ctx.arc(this.startX , this.startY , this.radius , 0 , 2 * Math.PI);
                this.ctx.stroke();
                this.ctx.closePath();
            }
        }
    }

    handleMouseUp = (e: MouseEvent) => {
      console.log("mouse up trigger");
      this.clicked = false;
      if(this.S_shape === "rect") {
        this.socket.send(JSON.stringify({
          type : "draw_shape",
          roomId : this.roomId,
          shape: JSON.stringify({
            x: this.startX,
            y: this.startY,
            width: this.width,
            height: this.height,
            type: "rect"
          })
        }))
      } else if(this.S_shape === "circle") {
        this.socket.send(JSON.stringify({
          type : "draw_shape",
          roomId : this.roomId,
          shape: JSON.stringify({
            x: this.startX,
            y: this.startY,
            radius: Math.sqrt(this.width * this.width + this.height * this.height),
            type: "circle"
          })
        }))
      }
      this.drawShape();
    }

    drawShape() {
        console.log("draw shape");
        this.ctx.clearRect(0 , 0 , this.canvas.width , this.canvas.height);
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0 , 0 , this.canvas.width , this.canvas.height);
        this.Shape.map((item) => {
            if(item.type === "rect") {
                this.ctx.strokeStyle = "black";
                this.ctx.strokeRect(item.x , item.y , item.width , item.height);
            } else if(item.type === "circle") {
                this.ctx.strokeStyle = "black";
                this.ctx.beginPath();
                this.ctx.arc(item.x , item.y , item.radius , 0 , 2 * Math.PI);
                this.ctx.stroke();
                this.ctx.closePath();
            }
        })
    }
}