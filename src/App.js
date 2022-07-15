import { useEffect, useState } from "react";
import "./App.css";

const { shell, ipcRenderer, receiveCode } = window?.electron;

const serverUrl = "https://door.casdoor.com";
const appName = "app-casnode";
const redirectPath = "/callback";
const clientId = "014ae4bd048734ca2dea";
const clientSecret = "f26a4115725867b7bb7b668c81e1f8f7fae1544d";

const redirectUrl = "casdoor://localhost:3000" + redirectPath;

const signinUrl = `${serverUrl}/login/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUrl)}&scope=read&state=${appName}`;

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
    await shell.openExternal(signinUrl);

    await receiveCode(async (event, code) => {
      const userInfo = await ipcRenderer.invoke(
        "getUserInfo",
        clientId,
        clientSecret
      );

      await ipcRenderer.invoke("focusWin");

      setUser(userInfo);
    });
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
