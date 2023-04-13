

const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

const width = (canvas.width = window.innerWidth);
const height = (canvas.height = window.innerHeight);

let mousePressX = 0;
let mousePressY = 0;

let currentMouseX = 0;
let currentMouseY = 0;

let dragging = false;

canvas.addEventListener(
  "mousedown",
  e => {
    mousePressX = e.clientX;
    mousePressY = e.clientY;
    dragging = true;
  },
  false
);

canvas.addEventListener(
  "mousemove",
  e => {
    currentMouseX = e.clientX;
    currentMouseY = e.clientY;
  },
  false
);

canvas.addEventListener("mouseup", () => { 
    dragging = false
})



const animate = () => {
    ctx.clearRect(0, 0, width, height);
  
    const x1 = mousePressX;
    const y1 = mousePressY;
    const x2 = currentMouseX;
    const y2 = currentMouseY;

    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    const startX = midX - (currentMouseY - mousePressY) / 2;
    const startY = midY + (currentMouseX - mousePressX) / 2;

    const endX = midX + (currentMouseY - mousePressY) / 2;
    const endY = midY - (currentMouseX - mousePressX) / 2;

    const arrowLine = (context, fromx, fromy, tox, toy) =>  {
        let headlen = 10; 
        let dx = tox - fromx;
        let dy = toy - fromy;
        let angle = Math.atan2(dy, dx);
        context.moveTo(fromx, fromy);
        context.lineTo(tox, toy);
        context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
        context.moveTo(tox, toy);
        context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
    }

    if (dragging) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      arrowLine(ctx, x2, y2, x1, y1);
      ctx.moveTo(startX, startY);
      ctx.bezierCurveTo(startX, startY, x2, y2, endX, endY)
      ctx.strokeStyle = "white";
      ctx.stroke();
    }
  
    requestAnimationFrame(animate);
};
  
animate();    