const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("chonkyCat", {
  onReact: (callback) => {
    ipcRenderer.on("pet-react", (_event, state) => callback(state));
  },
  onSetScale: (callback) => {
    ipcRenderer.on("pet-set-scale", (_event, scale) => callback(scale));
  },
});
