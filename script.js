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
