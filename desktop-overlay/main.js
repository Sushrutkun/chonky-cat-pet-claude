const { app, BrowserWindow, Tray, Menu, screen, nativeImage } = require("electron");

const PET_URL = "http://localhost:8420/index.html?widget=1";
const WINDOW_WIDTH = 384;
const WINDOW_HEIGHT = 416;
const MARGIN = 24;
const RETRY_MS = 2000;

let mainWindow = null;
let tray = null;

function bottomRightPosition() {
  const { width, height, x, y } = screen.getPrimaryDisplay().workArea;
  return {
    x: x + width - WINDOW_WIDTH - MARGIN,
    y: y + height - WINDOW_HEIGHT - MARGIN,
  };
}

function loadPet(window) {
  window.loadURL(PET_URL).catch(() => {
    setTimeout(() => {
      if (!window.isDestroyed()) loadPet(window);
    }, RETRY_MS);
  });
}

function createWindow() {
  const { x, y } = bottomRightPosition();

  mainWindow = new BrowserWindow({
    x,
    y,
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    frame: false,
    transparent: true,
    hasShadow: false,
    resizable: false,
    movable: true,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    webPreferences: {
      backgroundThrottling: false,
    },
  });

  mainWindow.setAlwaysOnTop(true, "floating");
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  loadPet(mainWindow);

  mainWindow.webContents.on("did-fail-load", () => {
    setTimeout(() => loadPet(mainWindow), RETRY_MS);
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function resetPosition() {
  if (!mainWindow) return;
  const { x, y } = bottomRightPosition();
  mainWindow.setPosition(x, y);
}

function toggleVisibility() {
  if (!mainWindow) return;
  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    mainWindow.show();
  }
}

function createTray() {
  tray = new Tray(nativeImage.createEmpty());
  tray.setTitle("🐱");
  tray.setToolTip("Chonky Cat");

  const menu = Menu.buildFromTemplate([
    { label: "Show/Hide", click: toggleVisibility },
    { label: "Reset position", click: resetPosition },
    { type: "separator" },
    { label: "Quit", click: () => app.quit() },
  ]);
  tray.setContextMenu(menu);
}

app.whenReady().then(() => {
  if (process.platform === "darwin") {
    app.dock.hide();
  }
  createWindow();
  createTray();
});

app.on("window-all-closed", (event) => {
  event.preventDefault();
});
