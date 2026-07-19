const FRAME_WIDTH = 192;
const FRAME_HEIGHT = 208;
const FPS = 8;

const STATES = [
  { key: "idle", label: "Idle", row: 0, frames: 7 },
  { key: "running-right", label: "Running (right)", row: 1, frames: 8 },
  { key: "running-left", label: "Running (left)", row: 2, frames: 8 },
  { key: "waving", label: "Waving", row: 3, frames: 4 },
  { key: "jumping", label: "Jumping", row: 4, frames: 5 },
  { key: "failed", label: "Failed", row: 5, frames: 8 },
  { key: "waiting", label: "Waiting", row: 6, frames: 6 },
  { key: "running", label: "Running", row: 7, frames: 6 },
  { key: "review", label: "Review", row: 8, frames: 6 },
];

// Rows 9-10 hold single-frame "look" poses at 22.5° steps around a compass,
// split across two rows because the sheet is 8 columns wide.
const LOOK_DIRECTIONS = [
  { angle: 0, label: "Up", row: 9, col: 0 },
  { angle: 22.5, label: "Up-right", row: 9, col: 1 },
  { angle: 45, label: "Up-right", row: 9, col: 2 },
  { angle: 67.5, label: "Up-right", row: 9, col: 3 },
  { angle: 90, label: "Right", row: 9, col: 4 },
  { angle: 112.5, label: "Down-right", row: 9, col: 5 },
  { angle: 135, label: "Down-right", row: 9, col: 6 },
  { angle: 157.5, label: "Down-right", row: 9, col: 7 },
  { angle: 180, label: "Down", row: 10, col: 0 },
  { angle: 202.5, label: "Down-left", row: 10, col: 1 },
  { angle: 225, label: "Down-left", row: 10, col: 2 },
  { angle: 247.5, label: "Down-left", row: 10, col: 3 },
  { angle: 270, label: "Left", row: 10, col: 4 },
  { angle: 292.5, label: "Up-left", row: 10, col: 5 },
  { angle: 315, label: "Up-left", row: 10, col: 6 },
  { angle: 337.5, label: "Up-left", row: 10, col: 7 },
];

const stage = document.getElementById("sprite-stage");
const stateLabel = document.getElementById("state-label");
const buttonsContainer = document.getElementById("state-buttons");
const compass = document.getElementById("compass");
const lookStage = document.getElementById("look-stage");
const lookLabel = document.getElementById("look-label");

let currentFrame = 0;
let currentState = STATES[0];
let timer = null;

function renderFrame() {
  const x = currentFrame * FRAME_WIDTH;
  const y = currentState.row * FRAME_HEIGHT;
  stage.style.backgroundPosition = `-${x}px -${y}px`;
}

function setState(state) {
  currentState = state;
  currentFrame = 0;
  stateLabel.textContent = state.label;
  renderFrame();

  document.querySelectorAll(".state-buttons button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.key === state.key);
  });
}

function tick() {
  currentFrame = (currentFrame + 1) % currentState.frames;
  renderFrame();
}

STATES.forEach((state) => {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = state.label;
  button.dataset.key = state.key;
  button.addEventListener("click", () => setState(state));
  buttonsContainer.appendChild(button);
});

setState(STATES[0]);
timer = setInterval(tick, 1000 / FPS);

function setLookDirection(direction) {
  const x = direction.col * FRAME_WIDTH;
  const y = direction.row * FRAME_HEIGHT;
  lookStage.style.backgroundPosition = `-${x}px -${y}px`;
  lookLabel.textContent = `${direction.label} (${direction.angle}°)`;

  compass.querySelectorAll("button").forEach((btn) => {
    btn.classList.toggle("active", Number(btn.dataset.angle) === direction.angle);
  });
}

LOOK_DIRECTIONS.forEach((direction) => {
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.angle = direction.angle;
  button.setAttribute("aria-label", `${direction.label} (${direction.angle} degrees)`);
  button.style.setProperty("--angle", `${direction.angle}deg`);
  button.addEventListener("click", () => setLookDirection(direction));
  compass.appendChild(button);
});

setLookDirection(LOOK_DIRECTIONS[0]);
