class nBodyProblem {
  constructor(params) {
    this.name = params.name
    this.g = params.g;
    this.dt = params.dt;
    this.sc = params.sc;

    this.masses = params.masses;
  }

  updatePositionVectors() {
    const massesLen = this.masses.length;

    for (let i = 0; i < massesLen; i++) {
      const massI = this.masses[i];

      massI.x += massI.vx * this.dt;
      massI.y += massI.vy * this.dt;
      massI.z += massI.vz * this.dt;
    }

    return this;
  }

  updateVelocityVectors() {
    const massesLen = this.masses.length;

    for (let i = 0; i < massesLen; i++) {
      const massI = this.masses[i];

      massI.vx += massI.ax * this.dt;
      massI.vy += massI.ay * this.dt;
      massI.vz += massI.az * this.dt;
    }
  }

  updateAccelerationVectors() {
    const massesLen = this.masses.length;

    for (let i = 0; i < massesLen; i++) {
      let ax = 0;
      let ay = 0;
      let az = 0;

      const massI = this.masses[i];

      for (let j = 0; j < massesLen; j++) {
        if (i !== j) {
          const massJ = this.masses[j];

          const dx = massJ.x - massI.x;
          const dy = massJ.y - massI.y;
          const dz = massJ.z - massI.z;

          const distSq = dx * dx + dy * dy + dz * dz;

          const f = (this.g * massJ.m) / (distSq * Math.sqrt(distSq + this.sc));

          ax += dx * f;
          ay += dy * f;
          az += dz * f;
        }
      }

      massI.ax = ax;
      massI.ay = ay;
      massI.az = az;
    }

    return this;
  }
}

const g = 39.5;
const dt = 0.005;
const sc = 0.15; 

const masses = [
];

const system = new nBodyProblem({
  g,
  dt,
  masses: JSON.parse(JSON.stringify(masses)),
  sc
});

class Manifestation {
  constructor(ctx, trailLength, radius) {
    this.ctx = ctx;
  
    this.trailLength = trailLength;

    this.radius = radius;

    this.positions = [];
  }

  storePosition(x, y) {
    this.positions.push({
      x,
      y
    });

    if (this.positions.length > this.trailLength) this.positions.shift();
  }

  draw(x, y) {
    this.storePosition(x, y);

    const positionsLen = this.positions.length;

    for (let i = 0; i < positionsLen; i++) {
      let transparency;
      let circleScaleFactor;

      const scaleFactor = i / positionsLen;

      if (i === positionsLen - 1) {
        transparency = 1;
        circleScaleFactor = 1;
      } else {
        transparency = scaleFactor / 2;      
        circleScaleFactor = scaleFactor;
      }

      this.ctx.beginPath();
      this.ctx.arc(
        this.positions[i].x,
        this.positions[i].y,
        circleScaleFactor * this.radius,
        0,
        2 * Math.PI
      );
      this.ctx.fillStyle = `rgb(255, 208, 79, ${transparency})`;

      this.ctx.fill();
    }
  }
}

const scale = 70;
const radius = 4;
const trailLength = 35;

document.querySelector('#reset-button').addEventListener('click', () => {
  system.masses = []      
}, false);

document.querySelector("#apply-button").addEventListener('click', () => {
  const option = document.querySelector('select').selectedOptions[0]
  const massInput = document.querySelector('#mass')
  system.masses.forEach(mass => {
    if(mass.name === option.label){
      mass.m = Number(massInput.value)
      massInput.value = ""
    }
  })
  console.log(system)
}, false)

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

const massesList = document.querySelector("#masses-list");

canvas.addEventListener(
  "mouseup",
  e => {
    const x = (mousePressX - width / 2) / scale;
    const y = (mousePressY - height / 2) / scale;
    const z = 0;
    const vx = (mousePressX - e.clientX) / 35;
    const vy = (mousePressY - e.clientY) / 35;
    const vz = 0;

    const newName = `Ball ${system.masses.length + 1}`

    system.masses.push({
      name: newName, 
      m: parseFloat(massesList.value),
      x,
      y,
      z,
      vx,
      vy,
      vz,
      manifestation: new Manifestation(ctx, trailLength, radius)
    });

    const newOption = document.createElement("option")
    newOption.value = parseFloat(massesList.value)
    newOption.label = newName
    massesList.appendChild(newOption)

    dragging = false;
  },
  false
);


const animate = () => {

  system
  .updatePositionVectors()
  .updateAccelerationVectors()
  .updateVelocityVectors();

    ctx.clearRect(0, 0, width, height);
  
    const massesLen = system.masses.length;

    for (let i = 0; i < massesLen; i++) {
      const massI = system.masses[i];
  
      const x = width / 2 + massI.x * scale;
      const y = height / 2 + massI.y * scale;
  
      massI.manifestation.draw(x, y);

  
      if (massI.name) {
        ctx.font = "14px Arial";
        ctx.fillText(massI.name, x + 12, y + 4);
        ctx.fill();
      }
      
  
      if (x < radius || x > width - radius) massI.vx = -massI.vx;
  
      if (y < radius || y > height - radius) massI.vy = -massI.vy;
    }

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