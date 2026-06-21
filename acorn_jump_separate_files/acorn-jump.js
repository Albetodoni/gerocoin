const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const startBtn = document.getElementById("start");

let best = Number(localStorage.getItem("gero_acorn_jump_best") || 0);
bestEl.textContent = best;

let running = false;
let score = 0;
let speed = 6;
let frame = 0;
let acorns = [];

const gero = new Image();
gero.src = "gero.PNG";

const player = {
  x: 90,
  y: 185,
  w: 64,
  h: 64,
  vy: 0,
  gravity: 0.75,
  jumpPower: -15,
  grounded: true
};

function reset(){
  running = true;
  score = 0;
  speed = 6;
  frame = 0;
  acorns = [];
  player.y = 185;
  player.vy = 0;
  player.grounded = true;
  startBtn.textContent = "RESTART";
  requestAnimationFrame(loop);
}

function jump(){
  if(!running){
    reset();
    return;
  }
  if(player.grounded){
    player.vy = player.jumpPower;
    player.grounded = false;
  }
}

function spawnAcorn(){
  acorns.push({x:canvas.width+20,y:215,w:34,h:34});
}

function update(){
  frame++;
  score++;
  scoreEl.textContent = score;

  if(frame % 240 === 0) speed += 0.45;
  if(frame % Math.max(52, 105 - Math.floor(speed*4)) === 0) spawnAcorn();

  player.vy += player.gravity;
  player.y += player.vy;

  if(player.y >= 185){
    player.y = 185;
    player.vy = 0;
    player.grounded = true;
  }

  acorns.forEach(a => a.x -= speed);
  acorns = acorns.filter(a => a.x + a.w > 0);

  for(const a of acorns){
    if(player.x < a.x+a.w && player.x+player.w > a.x && player.y < a.y+a.h && player.y+player.h > a.y){
      gameOver();
      return;
    }
  }
}

function drawGround(){
  ctx.strokeStyle = "#ffd36a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 250);
  ctx.lineTo(canvas.width, 250);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,211,106,.25)";
  for(let i=0;i<canvas.width;i+=42){
    const x = i - ((frame*speed)%42);
    ctx.fillRect(x, 258, 20, 3);
  }
}

function drawPlayer(){
  ctx.save();
  ctx.beginPath();
  ctx.arc(player.x+32, player.y+32, 33, 0, Math.PI*2);
  ctx.clip();
  if(gero.complete){
    ctx.drawImage(gero, player.x-13, player.y-13, player.w+26, player.h+26);
  } else {
    ctx.fillStyle = "#b56b24";
    ctx.fillRect(player.x, player.y, player.w, player.h);
  }
  ctx.restore();

  ctx.strokeStyle = "#ffd36a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(player.x+32, player.y+32, 33, 0, Math.PI*2);
  ctx.stroke();
}

function drawAcorn(a){
  ctx.fillStyle = "#8b4f1d";
  ctx.beginPath();
  ctx.ellipse(a.x+a.w/2, a.y+a.h/2+4, a.w/2, a.h/2, 0, 0, Math.PI*2);
  ctx.fill();

  ctx.fillStyle = "#3b220d";
  ctx.beginPath();
  ctx.ellipse(a.x+a.w/2, a.y+7, a.w/2.1, 9, 0, 0, Math.PI*2);
  ctx.fill();
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle = "rgba(255,211,106,.08)";
  for(let i=0;i<10;i++){
    ctx.beginPath();
    ctx.arc((i*120 + frame*.7)%canvas.width, 55 + Math.sin(frame/25+i)*18, 3, 0, Math.PI*2);
    ctx.fill();
  }

  drawGround();
  drawPlayer();
  acorns.forEach(drawAcorn);
}

function gameOver(){
  running = false;
  if(score > best){
    best = score;
    localStorage.setItem("gero_acorn_jump_best", best);
    bestEl.textContent = best;
  }
  draw();
  ctx.fillStyle = "rgba(0,0,0,.65)";
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = "#ffd36a";
  ctx.font = "bold 48px Arial";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", canvas.width/2, 120);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 22px Arial";
  ctx.fillText("Press SPACE or tap to restart", canvas.width/2, 158);
}

function loop(){
  if(!running) return;
  update();
  draw();
  requestAnimationFrame(loop);
}

startBtn.addEventListener("click", reset);
document.addEventListener("keydown", e => {
  if(e.code === "Space" || e.code === "ArrowUp"){
    e.preventDefault();
    jump();
  }
});
canvas.addEventListener("pointerdown", jump);
document.body.addEventListener("pointerdown", e => {
  if(e.target.tagName !== "BUTTON" && e.target.tagName !== "A") jump();
});

draw();
