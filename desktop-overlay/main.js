const path = require("path");
const fs = require("fs");
const http = require("http");
const { app, BrowserWindow, Tray, Menu, screen, nativeImage, ipcMain } = require("electron");

const PLUGIN_ROOT = path.join(__dirname, "..");
const PORT = 8420;
const PET_URL = `http://localhost:${PORT}/index.html?widget=1`;
const MARGIN = 24;
const RETRY_MS = 2000;

const FRAME_WIDTH = 192;
const FRAME_HEIGHT = 208;
const SIZE_PRESETS = {
  small: 1,
  medium: 1.5,
  large: 2,
  xl: 2.5,
  xxl: 3,
};
const DEFAULT_SIZE = "large";

const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".webp": "image/webp",
};

let mainWindow = null;
let tray = null;
let currentSize = DEFAULT_SIZE;

function settingsPath() {
  return path.join(app.getPath("userData"), "settings.json");
}

function loadSettings() {
  try {
    const raw = fs.readFileSync(settingsPath(), "utf-8");
    const parsed = JSON.parse(raw);
    if (parsed.size && SIZE_PRESETS[parsed.size]) {
      currentSize = parsed.size;
    }
  } catch {
    // no saved settings yet
  }
}

function saveSettings() {
  fs.mkdirSync(path.dirname(settingsPath()), { recursive: true });
  fs.writeFileSync(settingsPath(), JSON.stringify({ size: currentSize }));
}

function windowDimensions() {
  const scale = SIZE_PRESETS[currentSize];
  return {
    width: Math.round(FRAME_WIDTH * scale),
    height: Math.round(FRAME_HEIGHT * scale),
  };
}

function bottomRightPosition() {
  const { width, height } = windowDimensions();
  const { width: screenWidth, height: screenHeight, x, y } = screen.getPrimaryDisplay().workArea;
  return {
    x: x + screenWidth - width - MARGIN,
    y: y + screenHeight - height - MARGIN,
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
  const { width, height } = windowDimensions();
  const { x, y } = bottomRightPosition();

  mainWindow = new BrowserWindow({
    x,
    y,
    width,
    height,
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
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
  });

  mainWindow.setAlwaysOnTop(true, "floating");
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  loadPet(mainWindow);

  mainWindow.webContents.on("did-fail-load", () => {
    setTimeout(() => loadPet(mainWindow), RETRY_MS);
  });

  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.send("pet-set-scale", SIZE_PRESETS[currentSize]);
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

function applySize(size) {
  if (!SIZE_PRESETS[size] || !mainWindow) return;
  currentSize = size;
  saveSettings();

  const { width, height } = windowDimensions();
  const { x, y } = bottomRightPosition();
  mainWindow.setBounds({ x, y, width, height });
  mainWindow.webContents.send("pet-set-scale", SIZE_PRESETS[currentSize]);
  createTray();
}

function react(state) {
  if (!mainWindow) return;
  mainWindow.webContents.send("pet-react", state);
}

function createTray() {
  if (tray) {
    tray.destroy();
  }
  tray = new Tray(nativeImage.createEmpty());
  tray.setTitle("🐱");
  tray.setToolTip("Chonky Cat");

  const sizeItems = Object.keys(SIZE_PRESETS).map((key) => ({
    label: key,
    type: "radio",
    checked: key === currentSize,
    click: () => applySize(key),
  }));

  const menu = Menu.buildFromTemplate([
    { label: "Show/Hide", click: toggleVisibility },
    { label: "Reset position", click: resetPosition },
    { label: "Size", submenu: sizeItems },
    { type: "separator" },
    { label: "Quit", click: () => app.quit() },
  ]);
  tray.setContextMenu(menu);
}

function contentTypeFor(filePath) {
  return MIME_TYPES[path.extname(filePath)] || "application/octet-stream";
}

function startServer() {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);

    if (req.method === "POST" && url.pathname === "/react") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        try {
          const { state } = JSON.parse(body || "{}");
          react(state || "waving");
        } catch {
          // ignore malformed body
        }
        res.writeHead(200);
        res.end("ok");
      });
      return;
    }

    if (req.method === "POST" && url.pathname === "/size") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        try {
          const { preset } = JSON.parse(body || "{}");
          applySize(preset);
        } catch {
          // ignore malformed body
        }
        res.writeHead(200);
        res.end("ok");
      });
      return;
    }

    if (req.method !== "GET") {
      res.writeHead(405);
      res.end("method not allowed");
      return;
    }

    let pathname = url.pathname === "/" ? "/index.html" : url.pathname;
    const filePath = path.join(PLUGIN_ROOT, pathname);

    if (!filePath.startsWith(PLUGIN_ROOT)) {
      res.writeHead(403);
      res.end("forbidden");
      return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("not found");
        return;
      }
      res.writeHead(200, { "Content-Type": contentTypeFor(filePath) });
      res.end(data);
    });
  });

  server.listen(PORT, "127.0.0.1");
}

ipcMain.handle("chonky-cat:get-scale", () => SIZE_PRESETS[currentSize]);

const gotLock = app.requestSingleInstanceLock();

if (!gotLock) {
  app.quit();
} else {
  app.whenReady().then(() => {
    loadSettings();
    if (process.platform === "darwin") {
      app.dock.hide();
    }
    startServer();
    createWindow();
    createTray();
  });

  app.on("window-all-closed", (event) => {
    event.preventDefault();
  });
}
