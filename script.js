const launchDate = new Date();
launchDate.setDate(launchDate.getDate() + 18);
launchDate.setHours(20, 0, 0, 0);

const firebaseConfig = {
  apiKey: "AIzaSyCdbdu-CSZXa2MTJ0aB0AQy0jm1DQlwVjc",
  authDomain: "gerocoin.firebaseapp.com",
  projectId: "gerocoin",
  storageBucket: "gerocoin.firebasestorage.app",
  messagingSenderId: "775803852347",
  appId: "1:775803852347:web:938b77b5f250077d71ee1e",
  measurementId: "G-L3ZFGHCZ2Q"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const $ = (id) => document.getElementById(id);

function updateCountdown(){
  const diff = Math.max(0, launchDate - new Date());
  const d = Math.floor(diff / (1000*60*60*24));
  const h = Math.floor((diff / (1000*60*60)) % 24);
  const m = Math.floor((diff / (1000*60)) % 60);
  const s = Math.floor((diff / 1000) % 60);

  $("days").textContent = String(d).padStart(2,"0");
  $("hours").textContent = String(h).padStart(2,"0");
  $("minutes").textContent = String(m).padStart(2,"0");
  $("seconds").textContent = String(s).padStart(2,"0");
  $("daysLeft").textContent = d;
}
setInterval(updateCountdown, 1000);
updateCountdown();

let currentUserId = localStorage.getItem("geroUserId");

async function registerUser(){
  const name = $("nameInput").value.trim();

  if(!name){
    alert("Escribe tu nombre primero 🌰");
    return;
  }

  if(currentUserId){
    await db.collection("usuarios").doc(currentUserId).update({
      nombre: name
    });
  } else {
    const doc = await db.collection("usuarios").add({
      nombre: name,
      bellotas: 0,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    currentUserId = doc.id;
    localStorage.setItem("geroUserId", currentUserId);
  }

  alert("Bienvenido al Ejército de Gero, " + name + " 🌰🐿️");
}

async function giveAcorn(){
  if(!currentUserId){
    alert("Primero regístrate con tu nombre 🌰");
    return;
  }

  const userRef = db.collection("usuarios").doc(currentUserId);

  await userRef.update({
    bellotas: firebase.firestore.FieldValue.increment(1)
  });

  $("feedBtn").animate([
    {transform:"scale(1)"},
    {transform:"scale(1.08)"},
    {transform:"scale(1)"}
  ], {duration:220});
}

function listenUser(){
  if(!currentUserId) return;

  db.collection("usuarios").doc(currentUserId).onSnapshot((doc) => {
    if(doc.exists){
      $("personalAcorns").textContent = doc.data().bellotas || 0;
    }
  });
}

function listenLeaderboard(){
  db.collection("usuarios")
    .orderBy("bellotas", "desc")
    .limit(10)
    .onSnapshot((snapshot) => {
      const list = $("leaderboardList");
      list.innerHTML = "";

      snapshot.forEach((doc, index) => {
        const data = doc.data();
        const li = document.createElement("li");
        li.innerHTML = `${index + 1}. ${data.nombre || "Anónimo"} <b>${data.bellotas || 0}</b> 🌰`;
        list.appendChild(li);
      });
    });
}

function listenStats(){
  db.collection("usuarios").onSnapshot((snapshot) => {
    let totalAcorns = 0;
    let totalUsers = 0;

    snapshot.forEach((doc) => {
      totalUsers++;
      totalAcorns += doc.data().bellotas || 0;
    });

    $("joined").textContent = totalUsers.toLocaleString();
    $("acornTotal").textContent = totalAcorns.toLocaleString();
  });
}

async function countVisit(){
  const visitRef = db.collection("stats").doc("visitas");

  await db.runTransaction(async (transaction) => {
    const doc = await transaction.get(visitRef);

    if(!doc.exists){
      transaction.set(visitRef, { total: 1 });
    } else {
      transaction.update(visitRef, {
        total: firebase.firestore.FieldValue.increment(1)
      });
    }
  });

  visitRef.onSnapshot((doc) => {
    if(doc.exists){
      $("visits").textContent = doc.data().total.toLocaleString();
    }
  });
}

$("registerBtn").addEventListener("click", async () => {
  await registerUser();
  listenUser();
});

$("feedBtn").addEventListener("click", giveAcorn);

listenUser();
listenLeaderboard();
listenStats();
countVisit();
/* =========================
   GERO JUMP GAME
========================= */

const geroCanvas = document.getElementById("geroGame");
const geroCtx = geroCanvas ? geroCanvas.getContext("2d") : null;
const gameBackground = new Image();

gameBackground.src = "game-background.png.png";
gameBackground.onload = function () {
    if (geroCtx) {
        geroCtx.drawImage(gameBackground, 0, 0, geroCanvas.width, geroCanvas.height);
    }
};
let jumpGameRunning = false;
let jumpGameStarted = false;

let gero = {
  x: 90,
  y: 185,
  width: 46,
  height: 46,
  velocityY: 0,
  gravity: 0.75,
  jumpPower: -15,
  onGround: true
};

let geroObstacles = [];
let geroAcorns = [];
let geroScore = 0;
let geroBestScore = Number(localStorage.getItem("geroBestScore")) || 0;
let geroSpeed = 6;
let geroFrame = 0;

const bestScoreEl = document.getElementById("bestScore");
const gameAcornsEl = document.getElementById("gameAcorns");

if (bestScoreEl) bestScoreEl.textContent = geroBestScore;

function startGeroJump() {
  if (!geroCanvas || !geroCtx) return;

  jumpGameRunning = true;
  jumpGameStarted = true;

  gero.y = 185;
  gero.velocityY = 0;
  gero.onGround = true;

  geroObstacles = [];
  geroAcorns = [];
  geroScore = 0;
  geroSpeed = 6;
  geroFrame = 0;

  updateGeroJump();
}

function geroJump() {
  if (!jumpGameStarted || !jumpGameRunning) {
    startGeroJump();
    return;
  }

  if (gero.onGround) {
    gero.velocityY = gero.jumpPower;
    gero.onGround = false;
  }
}

function updateGeroJump() {
  if (!jumpGameRunning || !geroCtx) return;

  geroFrame++;

  geroCtx.clearRect(0, 0, geroCanvas.width, geroCanvas.height);

if (gameBackground.complete) {
    geroCtx.drawImage(gameBackground, 0, 0, geroCanvas.width, geroCanvas.height);
} else {
    geroCtx.fillStyle = "#080808";
    geroCtx.fillRect(0, 0, geroCanvas.width, geroCanvas.height);
}
  geroCtx.fillStyle = "#ffb347";
 

  gero.velocityY += gero.gravity;
  gero.y += gero.velocityY;

  if (gero.y >= 185) {
    gero.y = 185;
    gero.velocityY = 0;
    gero.onGround = true;
  }

  geroCtx.font = "42px Arial";
  geroCtx.fillText("🐿️", gero.x, gero.y + 38);

  if (geroFrame % 90 === 0) {
    geroObstacles.push({
      x: geroCanvas.width,
      y: 190,
      width: 40,
      height: 45,
type: "🍄"
    });
  }

  if (geroFrame % 130 === 0) {
    geroAcorns.push({
      x: geroCanvas.width,
      y: 80 + Math.random() * 70,
      width: 30,
      height: 30
    });
  }

  geroObstacles.forEach((obstacle, index) => {
    obstacle.x -= geroSpeed;

    geroCtx.font = "38px Arial";
    geroCtx.fillText(obstacle.type, obstacle.x, obstacle.y + 38);

    if (obstacle.x + obstacle.width < 0) {
      geroObstacles.splice(index, 1);
      geroScore += 5;
    }

    if (
      gero.x < obstacle.x + obstacle.width &&
      gero.x + gero.width > obstacle.x &&
      gero.y < obstacle.y + obstacle.height &&
      gero.y + gero.height > obstacle.y
    ) {
      endGeroJump();
    }
  });

  geroAcorns.forEach((acorn, index) => {
    acorn.x -= geroSpeed;

    geroCtx.font = "30px Arial";
    geroCtx.fillText("🌰", acorn.x, acorn.y);

    if (
      gero.x < acorn.x + acorn.width &&
      gero.x + gero.width > acorn.x &&
      gero.y < acorn.y + acorn.height &&
      gero.y + gero.height > acorn.y
    ) {
      geroAcorns.splice(index, 1);
      geroScore += 20;
    }

    if (acorn.x + acorn.width < 0) {
      geroAcorns.splice(index, 1);
    }
  });

  if (geroFrame % 1800 === 0) {
    geroSpeed += 1;
  }

  if (gameAcornsEl) gameAcornsEl.textContent = geroScore;

  geroCtx.fillStyle = "#ffb347";
  geroCtx.font = "22px Arial";
  geroCtx.fillText("Score: " + geroScore, 20, 35);

  requestAnimationFrame(updateGeroJump);
}

function endGeroJump() {
  jumpGameRunning = false;

  if (geroScore > geroBestScore) {
    geroBestScore = geroScore;
    localStorage.setItem("geroBestScore", geroBestScore);
    if (bestScoreEl) bestScoreEl.textContent = geroBestScore;
  }

  setTimeout(() => {
    alert("Game Over 🌰 Score: " + geroScore + "\nPress SPACE or tap the game to play again.");
  }, 100);
}

document.addEventListener("keydown", function (event) {
  if (event.code === "Space" || event.code === "ArrowUp") {
    event.preventDefault();
    geroJump();
  }
});

if (geroCanvas) {
  geroCanvas.addEventListener("click", geroJump);
  geroCanvas.addEventListener("touchstart", geroJump);
}
const musicBtn = document.getElementById("musicBtn");
const bgMusic = document.getElementById("bgMusic");

let musicPlaying = false;

if (bgMusic) {
  bgMusic.volume = 0.18;
}

if (musicBtn && bgMusic) {
  musicBtn.addEventListener("click", async () => {
    if (!musicPlaying) {
      bgMusic.play();
      musicPlaying = true;
      musicBtn.textContent = "🔊 Music ON";
    } else {
      bgMusic.pause();
      musicPlaying = false;
      musicBtn.textContent = "🔇 Music OFF";
    }
  });
}
