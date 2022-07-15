const { contextBridge, ipcRenderer, remote, shell } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  ipcRenderer,
  remote,
  shell,
  receiveCode: (handler) => ipcRenderer.on('receiveCode', (event, ...args) => handler(...args)),
});
