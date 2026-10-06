const { contextBridge, ipcRenderer } = require("electron");

function subscribe(channel, handler) {
  const listener = (event, value) => handler(value);
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
}

// The only things the page can do: the sign-in itself runs in the main process, see electron.js
contextBridge.exposeInMainWorld("casdoor", {
  signin: () => ipcRenderer.invoke("casdoor:signin"),
  signout: () => ipcRenderer.invoke("casdoor:signout"),
  getUser: () => ipcRenderer.invoke("casdoor:getUser"),
  // both return a function that removes the handler
  onUser: (handler) => subscribe("casdoor:user", handler),
  onError: (handler) => subscribe("casdoor:error", handler),
});
