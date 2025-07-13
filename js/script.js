const board = document.getElementById("board");
const pieceContainer = document.getElementById("pieceContainer");
const finishButton = document.getElementById("finishButton");
const startButton = document.getElementById("startButton");
const resetButton = document.getElementById("resetButton");
const playerInput = document.getElementById("playerName");
const playersList = document.getElementById("playersList");
const finalTime = document.getElementById("finalTime");

let selectedPiece = null, startTime = 0, playerName = "";
const numPieces = 25;
const originalPositions = new Map();

// Início
playerInput.addEventListener("keydown", e => {
  if (e.key === "Enter") startButton.click();
});

startButton.onclick = () => {
  if (playerInput.value.trim()) {
    playerName = playerInput.value.trim();
    document.getElementById("register-screen").style.display = "none";
    document.getElementById("game-screen").style.display = "block";
    startTime = Date.now();
  }
};

resetButton.onclick = () => {
  localStorage.removeItem("players");
  playersList.innerHTML = "";
};

// Criação do tabuleiro
for (let i = 0; i < numPieces; i++) {
  const square = document.createElement("div");
  square.className = "square";
  square.onclick = () => {
    if (square.firstChild) {
      pieceContainer.appendChild(square.firstChild);
      finishButton.style.display = "none";
    } else if (selectedPiece) {
      square.appendChild(selectedPiece);
      selectedPiece = null;
      checkComplete();
    }
  };
  board.appendChild(square);
}

// Criação das peças embaralhadas
let indices = [...Array(numPieces).keys()].sort(() => Math.random() - 0.5);
indices.forEach(idx => {
  let p = document.createElement("div");
  p.className = "piece";
  p.dataset.id = idx;
  let x = idx % 5, y = Math.floor(idx / 5);
  p.style.backgroundPosition = `-${x * 60}px -${y * 60}px`;
  p.onclick = () => selectedPiece = p;
  pieceContainer.appendChild(p);
  originalPositions.set(p.dataset.id, pieceContainer);
});

// Verifica se todas peças foram colocadas
function checkComplete() {
  const allPlaced = [...document.querySelectorAll(".square")].every(s => s.firstChild);
  if (allPlaced) finishButton.style.display = "inline-block";
}

finishButton.onclick = () => {
  let total = Math.floor((Date.now() - startTime) / 1000);
  finalTime.textContent = `${playerName}, você levou ${total} segundos!`;
  savePlayer(playerName, total);
  showPlayers();
  document.getElementById("game-screen").style.display = "none";
  document.getElementById("end-screen").style.display = "block";
  startConfetti();
};

// Armazena dados no localStorage
function savePlayer(name, time) {
  let list = JSON.parse(localStorage.getItem("players") || "[]");
  list.push({ name, time });
  list.sort((a, b) => a.time - b.time);
  localStorage.setItem("players", JSON.stringify(list));
}

function showPlayers() {
  playersList.innerHTML = "";
  let players = JSON.parse(localStorage.getItem("players") || "[]");
  players.forEach(p => {
    if (p.name && p.time != null) {
      let li = document.createElement("li");
      li.textContent = `${p.name} - ${p.time}s`;
      playersList.appendChild(li);
    }
  });
}

function startConfetti() {
  const canvas = document.getElementById("confettiCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.display = "block";

  let confetti = Array.from({ length: 150 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * -canvas.height,
    r: Math.random() * 5 + 2,
    d: Math.random() * 5 + 1,
    color: `hsl(${Math.random() * 360},100%,60%)`,
    tilt: Math.random() * 2
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confetti.forEach(c => {
      ctx.beginPath();
      ctx.fillStyle = c.color;
      ctx.ellipse(c.x, c.y, c.r, c.r / 2, c.tilt, 0, Math.PI * 2);
      ctx.fill();
      c.y += c.d;
      if (c.y > canvas.height) c.y = -10;
    });
  }

  const interval = setInterval(draw, 30);
  setTimeout(() => {
    clearInterval(interval);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.display = "none";
  }, 5000);
}
