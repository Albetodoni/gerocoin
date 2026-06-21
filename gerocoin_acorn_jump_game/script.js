const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const startBtn = document.getElementById("startBtn");

let best = Number(localStorage.getItem("geroBestScore") || 0);
bestEl.textContent = best;

let running = false;
let gameOver = false;
let score = 0;
let speed = 6;
let frame = 0;
let obstacles = [];

const geroImg = new Image();
geroImg.src = "gero.PNG";

const player = {
  x: 90,
  y: 174,
  w: 58,
  h: 58,
  vy: 0,
  gravity: 0.72,
  jump: -14,
  grounded: true
};

function resetGame(){
  running = true;
  gameOver = false;
  score = 0;
  speed = 6;
  frame = 0;
  obstacles = [];
  player.y = 174;
  player.vy = 0;
  player.grounded = true;
  startBtn.textContent = "RESTART";
  loop();
}

function jump(){
  if(!running || gameOver){
    resetGame();
    return;
  }
  if(player.grounded){
    player.vy = player.jump;
    player.grounded = false;
  }
}

function spawnObstacle(){
  obstacles.push({
    x: canvas.width + 20,
    y: 198,
    w: 34,
    h: 34
  });
}

function update(){
  frame++;
  score++;
  scoreEl.textContent = score;

  if(frame % 240 === 0) speed += 0.45;
  if(frame % Math.max(55, 105 - Math.floor(speed * 4)) === 0) spawnObstacle();

  player.vy += player.gravity;
  player.y += player.vy;

  if(player.y >= 174){
    player.y = 174;
    player.vy = 0;
    player.grounded = true;
  }

  obstacles.forEach(o => o.x -= speed);
  obstacles = obstacles.filter(o => o.x + o.w > -10);

  for(const o of obstacles){
    if(
      player.x < o.x + o.w &&
      player.x + player.w > o.x &&
      player.y < o.y + o.h &&
      player.y + player.h > o.y
    ){
      endGame();
    }
  }
}

function endGame(){
  running = false;
  gameOver = true;
  if(score > best){
    best = score;
    localStorage.setItem("geroBestScore", best);
    bestEl.textContent = best;
  }
  draw();
  ctx.fillStyle = "rgba(0,0,0,.62)";
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = "#ffd36a";
  ctx.font = "bold 46px Arial";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", canvas.width/2, 115);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 20px Arial";
  ctx.fillText("Press SPACE or tap to restart", canvas.width/2, 150);
}

function drawGround(){
  ctx.strokeStyle = "#ffd36a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 232);
  ctx.lineTo(canvas.width, 232);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,211,106,.25)";
  for(let i=0;i<canvas.width;i+=42){
    const x = (i - (frame*speed)%42);
    ctx.fillRect(x, 238, 18, 3);
  }
}

function drawPlayer(){
  ctx.save();
  ctx.beginPath();
  ctx.arc(player.x + 29, player.y + 29, 31, 0, Math.PI*2);
  ctx.clip();
  if(geroImg.complete){
    ctx.drawImage(geroImg, player.x-8, player.y-8, player.w+16, player.h+16);
  }else{
    ctx.fillStyle = "#b56b24";
    ctx.fillRect(player.x,player.y,player.w,player.h);
  }
  ctx.restore();

  ctx.strokeStyle = "#ffd36a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(player.x + 29, player.y + 29, 31, 0, Math.PI*2);
  ctx.stroke();
}

function drawAcorn(x,y,w,h){
  ctx.fillStyle = "#8b4f1d";
  ctx.beginPath();
  ctx.ellipse(x+w/2, y+h/2+4, w/2, h/2, 0, 0, Math.PI*2);
  ctx.fill();

  ctx.fillStyle = "#3b220d";
  ctx.beginPath();
  ctx.ellipse(x+w/2, y+7, w/2.1, 9, 0, 0, Math.PI*2);
  ctx.fill();

  ctx.strokeStyle = "#ffd36a";
  ctx.lineWidth = 2;
  ctx.strokeRect(x+3,y+3,w-6,h-6);
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle = "rgba(255,211,106,.08)";
  for(let i=0;i<8;i++){
    ctx.beginPath();
    ctx.arc((i*130 + frame*0.6)%canvas.width, 50 + Math.sin(frame/25+i)*18, 3, 0, Math.PI*2);
    ctx.fill();
  }

  drawGround();
  drawPlayer();
  obstacles.forEach(o => drawAcorn(o.x,o.y,o.w,o.h));
}

function loop(){
  if(!running) return;
  update();
  draw();
  requestAnimationFrame(loop);
}

startBtn.addEventListener("click", resetGame);
document.addEventListener("keydown", e => {
  if(e.code === "Space" || e.code === "ArrowUp"){
    e.preventDefault();
    jump();
  }
});
canvas.addEventListener("pointerdown", jump);
document.body.addEventListener("pointerdown", e => {
  if(e.target.tagName !== "BUTTON") jump();
});

draw();
