const launchDate = new Date();
launchDate.setDate(launchDate.getDate() + 18);
launchDate.setHours(20, 0, 0, 0);

const $ = (id) => document.getElementById(id);

let personalAcorns = Number(localStorage.getItem("personalAcorns") || 0);
let joined = Number(localStorage.getItem("joined") || 2437);
let acornTotal = Number(localStorage.getItem("acornTotal") || 1248352);

function updateCountdown(){
  const now = new Date();
  const diff = Math.max(0, launchDate - now);
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

function renderStats(){
  $("personalAcorns").textContent = personalAcorns;
  $("joined").textContent = joined.toLocaleString();
  $("acornTotal").textContent = acornTotal.toLocaleString();
}
renderStats();

$("feedBtn").addEventListener("click", () => {
  personalAcorns++;
  acornTotal++;
  localStorage.setItem("personalAcorns", personalAcorns);
  localStorage.setItem("acornTotal", acornTotal);
  renderStats();
  $("feedBtn").animate([{transform:"scale(1)"},{transform:"scale(1.08)"},{transform:"scale(1)"}],{duration:220});
});

setInterval(() => {
  if(Math.random() > 0.55){
    joined++;
    localStorage.setItem("joined", joined);
    renderStats();
  }
}, 5000);

function createAcorn(){
  const a = document.createElement("div");
  a.className = "acorn";
  a.textContent = "🥜";
  a.style.left = Math.random()*100 + "vw";
  a.style.animationDuration = (4 + Math.random()*5) + "s";
  document.body.appendChild(a);
  setTimeout(()=>a.remove(), 9000);
}
setInterval(createAcorn, 600);
