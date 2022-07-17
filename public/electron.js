const path = require("path");
const url = require("url");
const axios = require("axios");
const { app, BrowserWindow, ipcMain } = require("electron");
const isDev = require("electron-is-dev");
const Store = require("electron-store");

const casdoorServiceDomain = "https://door.casdoor.com";
const authCodeUrl = casdoorServiceDomain + "/api/login/oauth/access_token";
const getUserInfoUrl = casdoorServiceDomain + "/api/login/oauth/introspect";

const store = new Store();
Store.initRenderer();
let mainWindow;

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

  mainWindow = win;
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

ipcMain.handle("focusWin", (event, ...args) => {
  app.focus();
});

async function getUserInfo(clientId, clientSecret, code) {
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

ipcMain.handle("getUserInfo", async (event, clientId, clientSecret) => {
  const code = store.get("casdoor_code");
  const userInfo = await getUserInfo(clientId, clientSecret, code);
  store.set("userInfo", userInfo);
  return userInfo;
});

ipcMain.handle("setStore", (event, key, data) => {
  store.set(key, data);
});

ipcMain.handle("getStore", (event, key) => {
  store.get(key);
});

ipcMain.handle("deleteStore", (event, key) => {
  store.delete(key);
});

const protocol = "casdoor";

function setDefaultProtocol() {
  app.removeAsDefaultProtocolClient(protocol);
  if (isDev && process.platform === "win32") {
    app.setAsDefaultProtocolClient(protocol, process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  } else {
    app.setAsDefaultProtocolClient(protocol);
  }
}

setDefaultProtocol();

const ProtocolRegExp = new RegExp(`^${protocol}://`);

async function watchProtocol() {
  app.on("open-url", (event, openUrl) => {
    const isProtocol = ProtocolRegExp.test(openUrl);
    if (isProtocol) {
      const params = url.parse(openUrl, true).query;
      if (params && params.code) {
        store.set("casdoor_code", params.code);
        mainWindow.webContents.send("receiveCode", params.code);
      }
    }
  });
  app.on("second-instance", (event, commandLine) => {
    commandLine.forEach((str) => {
      if (ProtocolRegExp.test(str)) {
        const params = url.parse(str, true).query;
        if (params && params.code) {
          store.set("casdoor_code", params.code);
          mainWindow.webContents.send("receiveCode", params.code);
        }
      }
    });
  });
}

watchProtocol();
