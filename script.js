const BOARD_SIZE = 4;
const TILE_COUNT = BOARD_SIZE * BOARD_SIZE;
const SOLVED_BOARD = Array.from({ length: TILE_COUNT }, (_, index) => index + 1);
SOLVED_BOARD[TILE_COUNT - 1] = 0;

const boardElement = document.querySelector("#board");
const moveCountElement = document.querySelector("#move-count");
const timerElement = document.querySelector("#timer");
const messageElement = document.querySelector("#message");
const newGameButton = document.querySelector("#new-game");
const resetButton = document.querySelector("#reset-game");

let board = [...SOLVED_BOARD];
let moveCount = 0;
let elapsedSeconds = 0;
let timerId = null;
let gameStarted = false;
let gameFinished = false;

function getNeighbors(emptyIndex) {
  const row = Math.floor(emptyIndex / BOARD_SIZE);
  const column = emptyIndex % BOARD_SIZE;
  const neighbors = [];

  if (row > 0) neighbors.push(emptyIndex - BOARD_SIZE);
  if (row < BOARD_SIZE - 1) neighbors.push(emptyIndex + BOARD_SIZE);
  if (column > 0) neighbors.push(emptyIndex - 1);
  if (column < BOARD_SIZE - 1) neighbors.push(emptyIndex + 1);

  return neighbors;
}

function moveTile(tileIndex) {
  if (gameFinished) return false;

  const emptyIndex = board.indexOf(0);
  if (!getNeighbors(emptyIndex).includes(tileIndex)) return false;

  [board[emptyIndex], board[tileIndex]] = [board[tileIndex], board[emptyIndex]];
  moveCount += 1;

  if (!gameStarted) {
    gameStarted = true;
    startTimer();
  }

  render();
  if (isSolved()) finishGame();
  return true;
}

function shuffleBoard() {
  board = [...SOLVED_BOARD];
  let previousEmptyIndex = -1;

  for (let move = 0; move < 250; move += 1) {
    const emptyIndex = board.indexOf(0);
    const choices = getNeighbors(emptyIndex).filter((index) => index !== previousEmptyIndex);
    const tileIndex = choices[Math.floor(Math.random() * choices.length)];
    previousEmptyIndex = emptyIndex;
    [board[emptyIndex], board[tileIndex]] = [board[tileIndex], board[emptyIndex]];
  }
}

function isSolved() {
  return board.every((tile, index) => tile === SOLVED_BOARD[index]);
}

function startNewGame() {
  stopTimer();
  shuffleBoard();
  moveCount = 0;
  elapsedSeconds = 0;
  gameStarted = false;
  gameFinished = false;
  messageElement.textContent = "Move a tile next to the empty space to begin.";
  messageElement.classList.remove("success");
  render();
}

function resetGame() {
  stopTimer();
  board = [...SOLVED_BOARD];
  moveCount = 0;
  elapsedSeconds = 0;
  gameStarted = false;
  gameFinished = false;
  messageElement.textContent = "Move a tile next to the empty space to begin.";
  messageElement.classList.remove("success");
  render();
}

function finishGame() {
  gameFinished = true;
  stopTimer();
  messageElement.textContent = `Solved in ${moveCount} moves. Great job!`;
  messageElement.classList.add("success");
  render();
}

function startTimer() {
  if (timerId !== null) return;
  timerId = setInterval(() => {
    elapsedSeconds += 1;
    updateStats();
  }, 1000);
}

function stopTimer() {
  if (timerId === null) return;
  clearInterval(timerId);
  timerId = null;
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

function updateStats() {
  moveCountElement.textContent = moveCount.toString();
  timerElement.textContent = formatTime(elapsedSeconds);
}

function render() {
  boardElement.replaceChildren();

  board.forEach((tile, index) => {
    const tileElement = document.createElement("button");
    tileElement.type = "button";
    tileElement.className = tile === 0 ? "tile empty" : "tile";
    tileElement.setAttribute("role", "gridcell");
    tileElement.setAttribute("aria-label", tile === 0 ? "Empty space" : `Tile ${tile}`);
    tileElement.textContent = tile === 0 ? "" : tile.toString();
    tileElement.addEventListener("click", () => moveTile(index));
    boardElement.append(tileElement);
  });

  updateStats();
}

document.addEventListener("keydown", (event) => {
  const emptyIndex = board.indexOf(0);
  const emptyRow = Math.floor(emptyIndex / BOARD_SIZE);
  const emptyColumn = emptyIndex % BOARD_SIZE;
  let tileIndex = -1;

  if (event.key === "ArrowUp" && emptyRow < BOARD_SIZE - 1) tileIndex = emptyIndex + BOARD_SIZE;
  if (event.key === "ArrowDown" && emptyRow > 0) tileIndex = emptyIndex - BOARD_SIZE;
  if (event.key === "ArrowLeft" && emptyColumn < BOARD_SIZE - 1) tileIndex = emptyIndex + 1;
  if (event.key === "ArrowRight" && emptyColumn > 0) tileIndex = emptyIndex - 1;

  if (tileIndex !== -1) {
    event.preventDefault();
    moveTile(tileIndex);
  }
});

newGameButton.addEventListener("click", startNewGame);
resetButton.addEventListener("click", resetGame);

render();
