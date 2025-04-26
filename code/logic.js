const game = document.getElementById("game");
const movesDisplay = document.getElementById("moves");
const moveBonusBtn = document.getElementById("moveBonusBtn");
const bombBtn = document.getElementById("bombBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const size = 9;
const fruitImages = [
  'https://raw.githubusercontent.com/ryan1114-carer/bear-3remove/refs/heads/main/images/red.png',
  'https://raw.githubusercontent.com/ryan1114-carer/bear-3remove/refs/heads/main/images/orange.png',
  'https://raw.githubusercontent.com/ryan1114-carer/bear-3remove/refs/heads/main/images/yellow.png',
  'https://raw.githubusercontent.com/ryan1114-carer/bear-3remove/refs/heads/main/images/green.png',
  'https://raw.githubusercontent.com/ryan1114-carer/bear-3remove/refs/heads/main/images/sky_blue.png',
  'https://raw.githubusercontent.com/ryan1114-carer/bear-3remove/refs/heads/main/images/blue.png',
  'https://raw.githubusercontent.com/ryan1114-carer/bear-3remove/refs/heads/main/images/purple.png'
];
let board = [];
let firstTile = null;
let moves = 108;
let shuffleTimes = 3;
let moveBonusUsed = false;
let bombUsed = false;

function updateMoves() {
  movesDisplay.textContent = `剩餘步數: ${moves}`;
}

function createBoard() {
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const tile = document.createElement("div");
      tile.classList.add("tile");
      tile.dataset.x = x;
      tile.dataset.y = y;
      tile.addEventListener("click", onTileClick);
      board.push(tile);
      game.appendChild(tile);
    }
  }
  fillBoard();
}

function randomFruit() {
  return fruitImages[Math.floor(Math.random() * fruitImages.length)];
}

function getTile(x, y) {
  if (x < 0 || x >= size || y < 0 || y >= size) return null;
  return board[y * size + x];
}

function fillBoard() {
  do {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const tile = getTile(x, y);
        tile.dataset.fruit = randomFruit();
        tile.style.backgroundImage = `url(${tile.dataset.fruit})`;
      }
    }
  } while (findMatches().length > 0);
}

function onTileClick(e) {
  const tile = e.target;
  if (firstTile && firstTile !== tile) {
    swapTiles(firstTile, tile);
    moves--;
    updateMoves();
    setTimeout(() => {
      handleMatches();
    }, 300);
    firstTile.style.border = "none";
    firstTile = null;
  } else {
    firstTile = tile;
    tile.style.border = "2px solid red";
  }
}

function swapTiles(tile1, tile2) {
  const temp = tile1.dataset.fruit;
  tile1.dataset.fruit = tile2.dataset.fruit;
  tile2.dataset.fruit = temp;

  tile1.style.backgroundImage = `url(${tile1.dataset.fruit})`;
  tile2.style.backgroundImage = `url(${tile2.dataset.fruit})`;
}

function findMatches() {
  let matched = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size - 2; x++) {
      const a = getTile(x, y), b = getTile(x+1, y), c = getTile(x+2, y);
      if (a.dataset.fruit && a.dataset.fruit === b.dataset.fruit && a.dataset.fruit === c.dataset.fruit) {
        matched.push(a, b, c);
      }
    }
  }
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size - 2; y++) {
      const a = getTile(x, y), b = getTile(x, y+1), c = getTile(x, y+2);
      if (a.dataset.fruit && a.dataset.fruit === b.dataset.fruit && a.dataset.fruit === c.dataset.fruit) {
        matched.push(a, b, c);
      }
    }
  }
  return [...new Set(matched)];
}

function handleMatches() {
  const matched = findMatches();
  if (matched.length > 0) {
    matched.forEach(tile => {
      tile.dataset.fruit = "";
      tile.style.backgroundImage = "none";
    });
    setTimeout(collapseBoard, 300);
  }
}

function collapseBoard() {
  for (let x = 0; x < size; x++) {
    for (let y = size-1; y >= 0; y--) {
      const tile = getTile(x, y);
      if (!tile.dataset.fruit) {
        for (let yy = y-1; yy >= 0; yy--) {
          const above = getTile(x, yy);
          if (above.dataset.fruit) {
            tile.dataset.fruit = above.dataset.fruit;
            tile.style.backgroundImage = `url(${tile.dataset.fruit})`;
            above.dataset.fruit = "";
            above.style.backgroundImage = "none";
            break;
          }
        }
      }
    }
  }
  setTimeout(() => {
    handleMatches();
  }, 300);
}

function useMoveBonus() {
  if (!moveBonusUsed) {
    moves += 8;
    updateMoves();
    moveBonusUsed = true;
    moveBonusBtn.textContent = "💩這個道具用完了";
    moveBonusBtn.disabled = true;
  }
}

function useBomb() {
  if (!bombUsed) {
    game.addEventListener('click', bombHandler, { once: true });
    bombUsed = true;
  } else {
    bombBtn.textContent = "💩這個道具用完了";
    bombBtn.disabled = true;
  }
}

function bombHandler(e) {
  const tile = e.target;
  const x = +tile.dataset.x;
  const y = +tile.dataset.y;
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const t = getTile(x+dx, y+dy);
      if (t) {
        t.dataset.fruit = "";
        t.style.backgroundImage = "none";
      }
    }
  }
  setTimeout(collapseBoard, 300);
  bombBtn.textContent = "💩這個道具用完了";
  bombBtn.disabled = true;
}

function useShuffle() {
  if (shuffleTimes > 0) {
    shuffleTimes--;
    board.sort(() => Math.random() - 0.5);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const tile = getTile(x, y);
        tile.dataset.x = x;
        tile.dataset.y = y;
        game.appendChild(tile);
      }
    }
    shuffleBtn.textContent = shuffleTimes > 0 ? `🌪️大風吹 (剩${shuffleTimes}次)` : "💩用完了";
    if (shuffleTimes === 0) shuffleBtn.disabled = true;
    setTimeout(() => {
      if (findMatches().length > 0) useShuffle();
    }, 300);
  }
}

createBoard();
updateMoves();
