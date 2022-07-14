import SDK from "casdoor-js-sdk";
import { useEffect, useState } from "react";
import "./App.css";

const { shell, ipcRenderer } = window?.electron;

const serverUrl = "https://door.casdoor.com";
const appName = "app-casnode";
const organizationName = "casbin";
const redirectPath = "/callback";
const clientId = "014ae4bd048734ca2dea";
const clientSecret = "f26a4115725867b7bb7b668c81e1f8f7fae1544d";

const redirectUrl = "http://localhost:3000" + redirectPath;
const sdkConfig = {
  serverUrl,
  clientId,
  appName,
  organizationName,
  redirectPath,
};
const sdk = new SDK(sdkConfig);

function App() {
  const [user, setUser] = useState();

  useEffect(() => {
    const getUserInfo = async () => {
      const userInfo = await ipcRenderer.invoke("getStore", "userInfo");
      setUser(userInfo);
    }
    getUserInfo();
  }, []);

  async function startAuth() {
    shell.openExternal(sdk.getSigninUrl());
    const { code } = await ipcRenderer.invoke("waitCallback", redirectUrl);
    await ipcRenderer.invoke("setStore", "casdoor_code", code);

    const userInfo = await ipcRenderer.invoke(
      "getUserInfo",
      clientId,
      clientSecret,
      code
    );
    await ipcRenderer.invoke("setStore", "userInfo", userInfo);

    await ipcRenderer.invoke("focusWin");

    setUser(userInfo);
  }

  async function logout() {
    await ipcRenderer.invoke("deleteStore", "userInfo");
    await ipcRenderer.invoke("deleteStore", "casdoor_code");
    setUser(undefined);
  }

  return (
    <div className="App">
      {!user ? (
        <button onClick={startAuth}>Login with Casdoor</button>
      ) : (
        <div className="index">
          <div>{`Username: ${user?.username}`}</div>
          <button onClick={logout}>Logout</button>
        </div>
      )}
    </div>
  );
}

export default App;
