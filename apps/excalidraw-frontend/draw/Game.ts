import { hrtime } from "process";
import getExistingShapes from "./existingShapes";
import { act } from "react";

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
    private clipboardShape: any = null;
    private contextMenu: HTMLElement | null = null; 

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

        this.contextMenu = document.getElementById("context-menu");
        if(this.contextMenu) {
            this.contextMenu.addEventListener("click" , this.handleContextMenuClick);
        }
        this.canvas.addEventListener("contextmenu" , this.handleRightClick);
        document.addEventListener("click", () => this.hideContextMenu());

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

        if(this.S_shape === "doodle") {
            this.ctx.beginPath();
            this.prevX = e.clientX;
            this.prevY = e.clientY;
        }
    }

    handleMouseMove = (e: MouseEvent) => {
        console.log("mouse move trigger");
        if(this.clicked) {
            this.width = e.clientX - this.startX;
            this.height = e.clientY - this.startY;
            this.drawShape();
            if(this.S_shape === "rect") {
                this.ctx.strokeStyle = "white";
                this.drawRoundedRect(this.startX, this.startY, this.width, this.height, 10);
                this.ctx.stroke();
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
                        x1: e.clientX,
                        y1: e.clientY,
                        type: "line"
                    })
                }))
                this.prevX = e.clientX;
                this.prevY = e.clientY;
            } else if(this.S_shape === "rhombus") {
                this.ctx.strokeStyle = "white";
                this.ctx.beginPath();
                const midX = (this.startX + e.clientX) / 2;
                const midY = (this.startY + e.clientY) / 2;
                this.ctx.moveTo(midX , this.startY);
                this.ctx.lineTo(e.clientX , midY);
                this.ctx.lineTo(midX, e.clientY);
                this.ctx.lineTo(this.startX, midY); 
                this.ctx.closePath();
                this.ctx.stroke();
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
        // this.ctx.stroke();
        // this.ctx.beginPath();
        this.ctx.closePath();
        this.prevX = 0;
        this.prevY = 0;
        return;
      } else if(this.S_shape === "rhombus") {
        this.socket.send(JSON.stringify({
            type: "draw_shape",
            roomId: this.roomId,
            shape: JSON.stringify({
                x1: this.startX,
                y1: this.startY,
                x2: e.clientX,
                y2: e.clientY,
                type: "rhombus"
            })
        }))
      }
      this.drawShape();
    }

    handleShapeClick = (e: MouseEvent) => {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        let foundIndex: number | null = null;
        const edgeThreshold = 10;
        for(let i = this.Shape.length - 1 ; i >= 0 ; i--) {
            const shape = this.Shape[i];
            if(shape.type === "rect") {
                // if(x >= shape.x && x < shape.x + shape.width && y >= shape.y && y <= shape.y + shape.height) {
                //     foundIndex = i;
                //     break;
                // }
                const left = Math.min(shape.x , shape.x + shape.width);
                const right = Math.max(shape.x , shape.x + shape.width);
                const top = Math.min(shape.y , shape.y + shape.height);
                const bottom = Math.max(shape.y , shape.y + shape.height);

                const nearLeft = Math.abs(x - left) <= edgeThreshold && y >= top && y <= bottom;
                const nearRight = Math.abs(x - right) <= edgeThreshold && y >= top && y <= bottom;
                const nearTop = Math.abs(y - top) <= edgeThreshold && x >= left && x <= right;
                const nearBottom = Math.abs(y - bottom) <= edgeThreshold && x >= left && x <= right;

                if(nearLeft || nearRight || nearTop || nearBottom) {
                    if (nearTop) console.log("Top edge clicked");
                    if (nearBottom) console.log("Bottom edge clicked");
                    foundIndex = i;
                    break;
                }

            } else if(shape.type === "circle") {
                const dx = x - shape.x;
                const dy = y - shape.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if(Math.abs(distance - shape.radius) <= edgeThreshold) {
                    console.log("clicked circle boundary");
                    foundIndex = i;
                    break;
                // } else if(shape.type === "line" || shape.type === "arrow") {
                //     const dist = this.pointToLineDistance(x, y, shape.x, shape.y, shape.x1, shape.y1);
                //     if(dist < 5) {
                //         foundIndex = i;
                //         break;
                //     }
                }
            } else if(shape.type === "oval") {
                const dx =  x - shape.x;
                const dy = y - shape.y;
                const rx = Math.abs(shape.width / 2);
                const ry = Math.abs(shape.height / 2);

                const ellipseEq = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);
                const edgeThreshold = 0.1;
                if(Math.abs(ellipseEq - 1) <= edgeThreshold) {
                    console.log("clicked oval bpundary");
                    foundIndex = i;
                    break;
                }
            } else if(shape.type === "line") {
                const dist = this.pointToLineDistance(x, y, shape.x, shape.y, shape.x1, shape.y1);
                if(dist < 5) {
                    console.log("Line clicked");
                    foundIndex = i;
                    break;
                }
            } else if(shape.type === "arrow") {
                const dist = this.pointToLineDistance(x, y, shape.x, shape.y, shape.x1, shape.y1);
                if(dist < 5) {
                    console.log("arrow clicked");
                    foundIndex = i;
                    break;
                }
            } else if(shape.type === "rhombus") {
                const { x1 , y1 , x2 , y2 } = shape;
                const midX = (x1 + x2) / 2;
                const midY = (y1 + y2) / 2;
                const vertices = [
                    {x: midX , y: y1},
                    { x: x2, y: midY },
                    { x: midX, y: y2 },
                    { x: x1, y: midY }
                ];

                const edgeThreshold = 5;
                for(let j = 0 ; j < vertices.length ; j++) {
                    const p1 = vertices[j];
                    const p2 = vertices[(j + 1) % vertices.length];
                    const dist = this.pointToLineDistance(x, y, p1.x, p1.y, p2.x, p2.y);
                    if(dist < edgeThreshold) {
                        console.log("rhombus is clicked");
                        foundIndex = i;
                        break;
                    }
                }
            } else if(shape.type === "text") {
                this.ctx.font = `${shape.fontSize || 20}px Arial`;
                const textWidth = this.ctx.measureText(shape.text).width;
                const textHeight = shape.fontSize || 20;
                const left = shape.x;
                const right = shape.x + textWidth;
                const top = shape.y;
                const bottom = shape.y + textHeight;
                if(x >= left && x <= right && y >= top && y <= bottom) {
                    console.log("text clicked");
                    foundIndex = i;
                    break;
                }
            }
        }

        this.selectedShapeIndex = foundIndex;
        this.drawShape()
    }

    handleRightClick = (e: MouseEvent) => {
        e.preventDefault();
        if(this.selectedShapeIndex == null) return;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;
        if(this.contextMenu) {
            this.contextMenu.style.display = "block";
            this.contextMenu.style.left = `${x}px`;
            this.contextMenu.style.top = `${y}px`;
        }
    }

    hideContextMenu() {
        if (this.contextMenu) this.contextMenu.style.display = "none";
    }

    handleContextMenuClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const action = target.getAttribute("data-action");
        if(!action) return;
        if(action === "cut") {
            if(this.selectedShapeIndex != null) {
                this.clipboardShape = { ...this.Shape[this.selectedShapeIndex] };
                this.Shape.splice(this.selectedShapeIndex, 1);
                this.selectedShapeIndex = null;
                this.drawShape();
            }
        } else if(action === "copy") {
            if(this.selectedShapeIndex != null) {
                this.clipboardShape = { ...this.Shape[this.selectedShapeIndex] };
            }
        } else if(action === "paste") {
            if(this.clipboardShape) {
                const newShape = { ...this.clipboardShape };
                if ("x" in newShape) newShape.x += 20;
                if ("y" in newShape) newShape.y += 20;
                if ("x1" in newShape) newShape.x1 += 20;
                if ("y1" in newShape) newShape.y1 += 20;
                this.Shape.push(newShape);
                this.selectedShapeIndex = this.Shape.length - 1;
                this.drawShape();
            }
        }
        this.hideContextMenu();
    }

    private drawDiamond(x1: number , x2: number , y1: number , y2: number) {
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const width = Math.abs(x2 - x1);
        const height = Math.abs(y2 - y1);

        this.ctx.beginPath();
        this.ctx.moveTo(midX , y1);
        this.ctx.lineTo(x2 , midY);
        this.ctx.lineTo(midX , y2);
        this.ctx.lineTo(x1 , midY);
        this.ctx.closePath();
    }

    private pointToLineDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const len_sq = C * C + D * D;
        let param = -1;
        if (len_sq !== 0) param = dot / len_sq;
        let xx, yy;

        if(param < 0) {
            xx = x1;
            yy = y1;
        } else if(param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        const dx = px - xx;
        const dy = py - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }

    private drawRoundedRect(x: number , y: number , width: number , height: number , radius: number = 10) {
        const r = Math.min(radius, Math.abs(width) / 2, Math.abs(height) / 2);
        this.ctx.beginPath();
        this.ctx.moveTo(x + r, y);
        this.ctx.lineTo(x + width - r, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + r);
        this.ctx.lineTo(x + width, y + height - r);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
        this.ctx.lineTo(x + r, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - r);
        this.ctx.lineTo(x, y + r);
        this.ctx.quadraticCurveTo(x, y, x + r, y);
        this.ctx.closePath();
    }

    private getBoundingBox(shape: any) {
        if(shape.type === "rect") {
            return {
                x: shape.x,
                y: shape.y,
                width: shape.width,
                height: shape.height
            };
        } else if(shape.type === "circle") {
            return {
                x: shape.x - shape.radius,
                y: shape.y - shape.radius,
                width: shape.radius * 2,
                height: shape.radius * 2
            };
        } else if(shape.type === "oval") {
            return {
                x: shape.x - Math.abs(shape.width / 2),
                y: shape.y - Math.abs(shape.height / 2),
                width: Math.abs(shape.width),
                height: Math.abs(shape.height)
            }
        } else if(shape.type === "rhombus") {
            const xMin = Math.min(shape.x1, shape.x2);
            const yMin = Math.min(shape.y1, shape.y2);
            const width = Math.abs(shape.x2 - shape.x1);
            const height = Math.abs(shape.y2 - shape.y1);
            return { x: xMin, y: yMin, width, height };
        }
    }

    drawShape() {
        console.log("draw shape");
        this.ctx.clearRect(0 , 0 , this.canvas.width , this.canvas.height);
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0 , 0 , this.canvas.width , this.canvas.height);
        this.Shape.map((item) => {
            if(item.type === "rect") {
                this.ctx.strokeStyle = "white";
                this.drawRoundedRect(item.x, item.y, item.width, item.height, 10);
                this.ctx.stroke();
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
            } else if(item.type === "oval") {
                this.ctx.strokeStyle ="white",
                this.drawEllipse(item.x , item.y , item.width / 2 , item.height / 2);
            } else if(item.type === "text") {
                this.ctx.fillStyle = item.color || "white";
                 this.ctx.font = `${item.fontSize || 20}px Arial`;
                 this.ctx.textBaseline = "top",
                 this.ctx.fillText(item.text , item.x , item.y);
            } else if(item.type === "rhombus") {
                this.ctx.strokeStyle = "white";
                this.drawDiamond(item.x1 , item.x2 , item.y1 , item.y2);
                this.ctx.stroke();
            }
        })

        if(this.selectedShapeIndex != null) {
            const shape = this.Shape[this.selectedShapeIndex];
            this.ctx.strokeStyle = "blue";
            this.ctx.lineWidth = 2;

            if(["rect" , "circle" , "oval" , "rhombus"].includes(shape.type)) {
                const bbox = this.getBoundingBox(shape);
                if(bbox) {
                    this.ctx.strokeRect(bbox.x - 4, bbox.y - 4, bbox.width + 8, bbox.height + 8);
                }
            } else if(shape.type === "line") {
                this.ctx.beginPath();
                this.ctx.moveTo(shape.x , shape.y);
                this.ctx.lineTo(shape.x1 , shape.y1);
                this.ctx.stroke();
                this.ctx.fillStyle = "blue";
                this.ctx.beginPath();
                this.ctx.arc(shape.x , shape.y , 4 , 0 , 2 * Math.PI);
                this.ctx.arc(shape.x1 , shape.y1 , 4 , 0 , 2 * Math.PI);
                this.ctx.fill();
            } else if(shape.type === "arrow") {
                const dx = shape.x1 - shape.x;
                const dy = shape.y1 - shape.y;
                const angle = Math.atan2(dy, dx);
                this.ctx.beginPath();
                this.ctx.moveTo(shape.x, shape.y);
                this.ctx.lineTo(shape.x1, shape.y1);
                this.ctx.lineTo(
                    shape.x1 - shape.headlen * Math.cos(angle - Math.PI / 6),
                    shape.y1 - shape.headlen * Math.sin(angle - Math.PI / 6)
                );
                this.ctx.moveTo(shape.x1, shape.y1);
                this.ctx.lineTo(
                    shape.x1 - shape.headlen * Math.cos(angle + Math.PI / 6),
                    shape.y1 - shape.headlen * Math.sin(angle + Math.PI / 6)
                );
                this.ctx.stroke();
                this.ctx.fillStyle = "blue";
                this.ctx.beginPath();
                this.ctx.arc(shape.x, shape.y, 4, 0, 2 * Math.PI);
                this.ctx.arc(shape.x1, shape.y1, 4, 0, 2 * Math.PI);
                this.ctx.fill();
            } else if(shape.type === "text") {
                this.ctx.font = `${shape.fontSize || 20}px Arial`;
                const textWidth = this.ctx.measureText(shape.text).width;
                const textHeight = shape.fontSize || 20;
                this.ctx.strokeStyle = "blue";
                this.ctx.strokeRect(shape.x - 2, shape.y - 2, textWidth + 4, textHeight + 4);
            }
        }
    }
}