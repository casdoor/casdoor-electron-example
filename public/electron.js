const path = require("path");
const crypto = require("crypto");
const { app, BrowserWindow, ipcMain, shell } = require("electron");

// The Casdoor application to sign in with, the defaults are the public demo server https://door.casdoor.com
const serverUrl = "https://door.casdoor.com";
const clientId = "014ae4bd048734ca2dea";
// Casdoor redirects to this URL after signing in, and the operating system opens the app with it.
// Must be in the Redirect URLs of the application.
const protocol = "casdoor";
const redirectUri = `${protocol}://callback`;

// handles the shortcuts of the Windows installer
if (require("electron-squirrel-startup")) {
  app.quit();
}

let mainWindow;
let user = null;
// the sign-in in progress: { state, codeVerifier }
let pendingSignin = null;

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(protocol, process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient(protocol);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // the page has no access to Node.js or Electron, only to the API of preload.js
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // "yarn dev" loads the page from the development server of React
  if (process.env.ELECTRON_START_URL) {
    mainWindow.loadURL(process.env.ELECTRON_START_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../build/index.html"));
  }
}

function base64url(buffer) {
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

// Opens the Casdoor sign-in page in the system browser.
// PKCE: only this app knows the code verifier, so the code is useless to anyone else, and no client secret is needed.
async function signin() {
  pendingSignin = {
    state: base64url(crypto.randomBytes(16)),
    codeVerifier: base64url(crypto.randomBytes(32)),
  };
  const codeChallenge = base64url(crypto.createHash("sha256").update(pendingSignin.codeVerifier).digest());

  const url = new URL(`${serverUrl}/login/oauth/authorize`);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", pendingSignin.state);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  await shell.openExternal(url.toString());
}

// Casdoor redirected to casdoor://callback?code=...&state=...
async function handleCallback(callbackUrl) {
  if (!callbackUrl.startsWith(redirectUri)) {
    return;
  }

  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.focus();
  }

  try {
    const params = new URL(callbackUrl).searchParams;
    if (!pendingSignin || params.get("state") !== pendingSignin.state) {
      throw new Error("invalid state, please sign in again");
    }
    const { codeVerifier } = pendingSignin;
    pendingSignin = null;
    if (params.get("error")) {
      throw new Error(params.get("error_description") || params.get("error"));
    }

    const tokenResponse = await fetch(`${serverUrl}/api/login/oauth/access_token`, {
      method: "POST",
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        code: params.get("code"),
        code_verifier: codeVerifier,
        redirect_uri: redirectUri,
      }),
    });
    const token = await tokenResponse.json();
    if (!token.access_token) {
      throw new Error(token.error_description || token.error || "failed to get the access token");
    }

    const userResponse = await fetch(`${serverUrl}/api/userinfo`, {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    const userInfo = await userResponse.json();
    if (!userResponse.ok || !userInfo.name) {
      throw new Error(userInfo.msg || "failed to get the user");
    }

    user = userInfo;
    mainWindow?.webContents.send("casdoor:user", user);
  } catch (e) {
    console.error(`Failed to sign in: ${e.message}`);
    mainWindow?.webContents.send("casdoor:error", e.message);
  }
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // the callback started a second instance, the first one gets its command line in "second-instance"
  app.quit();
} else {
  // Windows and Linux: the callback URL is an argument of the second instance
  app.on("second-instance", (event, commandLine) => {
    const callbackUrl = commandLine.find((arg) => arg.startsWith(`${protocol}://`));
    if (callbackUrl) {
      handleCallback(callbackUrl);
    }
  });

  // macOS: the callback URL is opened in the running app
  app.on("open-url", (event, openUrl) => {
    event.preventDefault();
    handleCallback(openUrl);
  });

  app.whenReady().then(createWindow);
}

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

// the API of the page, see preload.js
ipcMain.handle("casdoor:signin", () => signin());

ipcMain.handle("casdoor:getUser", () => user);

ipcMain.handle("casdoor:signout", () => {
  user = null;
  pendingSignin = null;
});
