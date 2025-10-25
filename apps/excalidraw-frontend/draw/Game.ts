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
    private headlen: number = 10;
    private prevX: number = 0;
    private prevY: number = 0;
    private selectedShapes: any[] = [];
    private selectedShapeIndex: number | null = null;

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

        const deleteBtn = document.getElementById("delete-btn");
        if(deleteBtn) {
            deleteBtn.addEventListener("click" , this.handleDeleteShape);
        }
    }

    handleDeleteShape = () => {
        console.log("Delete shape function...");
    }

    async fetchShapes() {
        console.log("Fetching shapes: ");
        const shapes = await getExistingShapes(this.roomId);
        this.Shape = shapes;
        this.drawShape();
    }

    drawEllipse(x: number , y: number , radiusX: number , radiusY: number) {
            radiusX = Math.abs(radiusX);
            radiusY = Math.abs(radiusY);
            
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.translate(x, y);
            this.ctx.scale(radiusX / radiusY, 1); 
            this.ctx.arc(0, 0, radiusY, 0, 2 * Math.PI);
            this.ctx.restore();
            this.ctx.stroke(); 
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
            } else if(data.type === "delete_shape") {
                this.Shape = this.Shape.filter((item) => {
                    if(item.id === data.id) {
                        console.log("Deleting shape: " , item);
                        return false;
                    }
                    return true;
                });
                this.drawShape();
            }
        }
    }

    initHandlers() {
        this.canvas.addEventListener("mousedown" , this.handleMouseDown);
        this.canvas.addEventListener("mousemove" , this.handleMouseMove);
        this.canvas.addEventListener("mouseup" , this.handleMouseUp);
        this.canvas.addEventListener("click" , this.handleShapeClick);
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
                this.ctx.strokeStyle = "white";
                this.ctx.beginPath();
                this.ctx.arc(this.startX , this.startY , Math.sqrt(this.width * this.width + this.height * this.height) , 0 , 2 * Math.PI);
                this.ctx.stroke();
            } else if(this.S_shape === "line") {
                this.ctx.strokeStyle = "white";
                this.ctx.beginPath();
                this.ctx.moveTo(this.startX , this.startY);
                this.ctx.lineTo(e.clientX , e.clientY);
                this.ctx.stroke();
            } else if(this.S_shape === "arrow") {
                const dx = e.clientX - this.startX;
                const dy = e.clientY - this.startY;
                const angle = Math.atan2(dy , dx);
                this.ctx.beginPath();
                this.ctx.moveTo(this.startX , this.startY);
                this.ctx.lineTo(e.clientX , e.clientY);
                this.ctx.lineTo(e.clientX - this.headlen * Math.cos(angle - Math.PI / 6) , e.clientY - this.headlen * Math.sin(angle - Math.PI / 6))
                this.ctx.moveTo(e.clientX , e.clientY);
                this.ctx.lineTo(e.clientX - this.headlen * Math.cos(angle + Math.PI / 6) , e.clientY - this.headlen * Math.sin(angle + Math.PI / 6))
                this.ctx.stroke();
            } else if(this.S_shape === "oval") {
                this.ctx.strokeStyle = "white";
                this.drawEllipse(this.startX , this.startY , this.width / 2 , this.height / 2);
            } else if(this.S_shape === "doodle") {
                this.ctx.lineCap = "round";
                this.ctx.beginPath();
                this.ctx.moveTo(this.prevX , this.prevY);
                this.ctx.lineTo(e.clientX , e.clientY);
                this.ctx.stroke();
                this.Shape.push({ x: this.prevX , y: this.prevY , x2: e.clientX , y2: e.clientY , type: "line" });
                this.socket.send(JSON.stringify({
                    type: "draw_shape",
                    roomId: this.roomId,
                    shape: JSON.stringify({
                        x: this.prevX,
                        y: this.prevY,
                        x2: e.clientX,
                        y2: e.clientY,
                        type: "line"
                    })
                }))
                this.prevX = e.clientX;
                this.prevY = e.clientY;
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
      } else if(this.S_shape === "line") {
        this.socket.send(JSON.stringify({
            type: "draw_shape",
            roomId: this.roomId,
            shape: JSON.stringify({
                x: this.startX,
                y: this.startY,
                x1: e.clientX,
                y1: e.clientY,
                type: "line"
            })
        }))
      } else if(this.S_shape === "arrow") {
        this.socket.send(JSON.stringify({
            type: "draw_shape",
            roomId: this.roomId,
            shape: JSON.stringify({
                x: this.startX,
                y: this.startY,
                x1: e.clientX,
                y1: e.clientY,
                headlen: this.headlen,
                type: "arrow"
            })
        }))
      } else if(this.S_shape === "oval") {
        this.socket.send(JSON.stringify({
            type: "draw_shape",
            roomId: this.roomId,
            shape: JSON.stringify({
                x: this.startX,
                y: this.startY,
                width: this.width,
                height: this.height,
                type: "oval"
            })
        }))
      } else if(this.S_shape === "text") {
        const text = prompt("Enter text: ");
        this.socket.send(JSON.stringify({
            type: "draw_shape",
            roomId: this.roomId,
            shape: JSON.stringify({
                x: e.clientX,
                y: e.clientY,
                text,
                fontSize: 20,
                color: "white",
                type: "text"
            })
        }))
      } else if(this.S_shape === "doodle") {
        this.ctx.stroke();
        this.ctx.beginPath();
      }
      this.drawShape();
    }

    handleShapeClick = (e: MouseEvent) => {
        const x = e.clientX;
        const y = e.clientY;

        let foundIndex: number | null = null;
        for(let i = this.Shape.length - 1 ; i >= 0 ; i--) {
            const shape = this.Shape[i];
            if(shape.type === "rect") {
                if(x >= shape.x && x < shape.x + shape.width && y >= shape.y && y <= shape.y + shape.height) {
                    foundIndex = i;
                    break;
                }
            } else if(shape.type === "circle") {
                const dx = x - shape.x;
                const dy = x - shape.y;
                if(Math.sqrt(dx * dx + dy * dy) <= shape.radius) {
                    foundIndex = i;
                    break;
                // } else if(shape.type === "line" || shape.type === "arrow") {
                //     const dist = this.pointToLineDistance(x, y, shape.x, shape.y, shape.x1, shape.y1);
                //     if(dist < 5) {
                //         foundIndex = i;
                //         break;
                //     }
                } else if(shape.type === "oval") {
                        const dx = x - shape.x;
                        const dy = y - shape.y;
                        const rx = Math.abs(shape.width / 2);
                        const ry = Math.abs(shape.height / 2);
                        if((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1) {
                            foundIndex = i;
                            break;
                        }
                }
            }
        }

        this.selectedShapeIndex = foundIndex;
        this.drawShape()
    }

    drawShape() {
        console.log("draw shape");
        this.ctx.clearRect(0 , 0 , this.canvas.width , this.canvas.height);
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0 , 0 , this.canvas.width , this.canvas.height);
        this.Shape.map((item) => {
            if(item.type === "rect") {
                this.ctx.strokeStyle = "white";
                this.ctx.strokeRect(item.x , item.y , item.width , item.height);
            } else if(item.type === "circle") {
                this.ctx.strokeStyle = "white";
                this.ctx.beginPath();
                this.ctx.arc(item.x , item.y , item.radius , 0 , 2 * Math.PI);
                this.ctx.stroke();
                this.ctx.closePath();
            } else if(item.type === "line") {
                this.ctx.strokeStyle = "white";
                this.ctx.beginPath();
                this.ctx.moveTo(item.x , item.y);
                this.ctx.lineTo(item.x1 , item.y1);
                this.ctx.stroke();
            } else if(item.type === "arrow") {
                const dx = item.x1 - item.x;
                const dy = item.y1 - item.y;
                const angle = Math.atan2(dy , dx);
                this.ctx.strokeStyle = "white";
                this.ctx.beginPath();
                this.ctx.moveTo(item.x , item.y);
                this.ctx.lineTo(item.x1 , item.y1);
                this.ctx.lineTo(item.x1 - item.headlen * Math.cos(angle - Math.PI / 6) , item.y1 - item.headlen * Math.sin(angle - Math.PI / 6))
                this.ctx.moveTo(item.x1 , item.y1);
                this.ctx.lineTo(item.x1 - item.headlen * Math.cos(angle + Math.PI / 6) , item.y1 - item.headlen * Math.sin(angle + Math.PI / 6))
                this.ctx.stroke();
            } else if(this.S_shape === "oval") {
                this.ctx.strokeStyle ="white",
                this.drawEllipse(item.x , item.y , item.width / 2 , item.height / 2);
            } else if(this.S_shape === "text") {
                this.ctx.fillStyle = item.color || "white";
                 this.ctx.font = `${item.fontSize || 20}px Arial`;
                 this.ctx.textBaseline = "top",
                 this.ctx.fillText(item.text , item.x , item.y);
            }
        })

        if(this.selectedShapeIndex != null) {
            const shape = this.Shape[this.selectedShapeIndex];
            this.ctx.strokeStyle = "blue";
            this.ctx.lineWidth = 2;

            if(shape.type === "rect") {
                this.ctx.strokeRect(shape.x - 2, shape.y - 2, shape.width + 4, shape.height + 4);
            } else if(shape.type === "circle") {
                this.ctx.beginPath();
                this.ctx.arc(shape.x, shape.y, shape.radius + 2, 0, 2 * Math.PI);
                this.ctx.stroke();
            } else if(shape.type === "oval") {
                this.drawEllipse(shape.x, shape.y, shape.width / 2 + 2, shape.height / 2 + 2);
            }
        }
    }
}