const path = require("path");
const express = require("express");
const url = require("url");
const axios = require("axios");
const { app, BrowserWindow, ipcMain } = require("electron");
const isDev = require("electron-is-dev");
const Store = require('electron-store');

const casdoorServiceDomain = "https://door.casdoor.com";
const authCodeUrl = casdoorServiceDomain + "/api/login/oauth/access_token";
const getUserInfoUrl = casdoorServiceDomain + "/api/login/oauth/introspect";

const store = new Store();
Store.initRenderer();

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle("waitCallback", async (event, redirectUri, options) => {
  const { protocol, hostname, port, pathname } = url.parse(redirectUri);
  if (protocol !== "http:" || hostname !== "localhost") {
    throw new Error("redirectUri should be an http://localhost url");
  }
  return new Promise((resolve, reject) => {
    const app = express();
    app.get(pathname, async (req, res) => {
      resolve(req.query);
      res.send("<html><body><script>window.close()</script></body></html>");
      setTimeout(shutdown, 100);
    });
    const server = app.listen(port);
    const shutdown = (reason) => {
      server.close();
      if (reason) {
        reject(new Error(reason));
      }
    };
    if (options && options.timeout) {
      setTimeout(() => shutdown("timeout"), options.timeout);
    }
  });
});

ipcMain.handle("focusWin", (event, ...args) => {
  app.focus();
});

ipcMain.handle(
  "getUserInfo",
  async (event, clientId, clientSecret, code) => {
    const { data } = await axios({
      method: "post",
      url: authCodeUrl,
      headers: {
        "content-type": "application/json",
      },
      data: JSON.stringify({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
      }),
    });
    const resp = await axios({
      method: "post",
      url: `${getUserInfoUrl}?token=${data.access_token}&client_id=${clientId}&client_secret=${clientSecret}`,
      headers: {
        "content-type": "application/json",
      },
      data: JSON.stringify({
        token: data.access_token,
        token_type_hint: "access_token",
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });
    return resp.data;
  }
);

ipcMain.handle("setStore", (event, key, data) => {
  store.set(key, data);
});

ipcMain.handle("getStore", (event, key) => {
  store.get(key);
});

ipcMain.handle("deleteStore", (event, key) => {
  store.delete(key);
});
