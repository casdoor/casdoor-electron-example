const { contextBridge, ipcRenderer, remote, shell } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  ipcRenderer,
  remote,
  shell,
});
