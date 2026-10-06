import { useEffect, useState } from "react";
import "./App.css";

// the API exposed by public/preload.js, the sign-in runs in the main process (public/electron.js)
const casdoor = window.casdoor;

function App() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    casdoor.getUser().then(setUser);

    const removeUserHandler = casdoor.onUser((signedInUser) => {
      setError("");
      setUser(signedInUser);
    });
    const removeErrorHandler = casdoor.onError((message) => {
      setError(`Failed to sign in: ${message}`);
    });
    return () => {
      removeUserHandler();
      removeErrorHandler();
    };
  }, []);

  async function signin() {
    setError("");
    // opens the Casdoor sign-in page in the browser, the user arrives through onUser
    await casdoor.signin();
  }

  async function signout() {
    await casdoor.signout();
    setUser(null);
  }

  return (
    <div className="App">
      {error && <div className="error">{error}</div>}
      {!user ? (
        <button onClick={signin}>Login with Casdoor</button>
      ) : (
        <div className="index">
          <div>{`Username: ${user.name}`}</div>
          <button onClick={signout}>Logout</button>
        </div>
      )}
    </div>
  );
}

export default App;
