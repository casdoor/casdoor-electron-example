# Casdoor Electron Example

[![Build](https://github.com/casdoor/casdoor-electron-example/actions/workflows/build.yml/badge.svg)](https://github.com/casdoor/casdoor-electron-example/actions/workflows/build.yml)
[![License](https://img.shields.io/github/license/casdoor/casdoor-electron-example)](https://github.com/casdoor/casdoor-electron-example/blob/master/LICENSE)
[![Discord](https://img.shields.io/discord/1022748306096537660?logo=discord&label=discord&color=5865F2)](https://discord.gg/5rPsrAzK7S)

An example [Electron](https://www.electronjs.org/) desktop app (with a React page) that signs users in with [Casdoor](https://casdoor.ai/) in the system browser, using the OAuth 2.0 authorization code flow with PKCE and a custom URL scheme.

## How it works

| File                                     | Runs in       | Role                                                                    |
|------------------------------------------|---------------|-------------------------------------------------------------------------|
| [public/electron.js](public/electron.js) | Main process  | The whole sign-in: opens the browser, receives the callback, gets the tokens and the user |
| [public/preload.js](public/preload.js)   | Preload       | Exposes `window.casdoor` (`signin`, `signout`, `getUser`, `onUser`, `onError`) to the page |
| [src/App.js](src/App.js)                 | Page (React)  | The buttons and the username                                            |

1. **Login with Casdoor** asks the main process to sign in. It creates a PKCE code verifier and a random state, and opens the Casdoor sign-in page in the system browser (`shell.openExternal()`).
2. After signing in, Casdoor redirects to `casdoor://callback?code=...&state=...`. The app is registered for the `casdoor` scheme (`app.setAsDefaultProtocolClient()`), so the operating system opens the app with that URL: as the argument of a second instance on Windows and Linux (`second-instance`), or with `open-url` on macOS.
3. The main process checks the state and exchanges the code for the tokens with the code verifier. No client secret is stored in the app.
4. It reads the user from Casdoor's `/api/userinfo` with the access token and sends it to the page.

The page runs with `contextIsolation` and `sandbox`, without Node.js: it can only call the functions of `window.casdoor`.

## Prerequisites

- Node.js 20+ and Yarn
- A Casdoor server. The example is preconfigured for the public demo server https://door.casdoor.com, so it runs as is. To use your own, see [Casdoor installation](https://casdoor.ai/docs/basic/server-installation).

## Configuration

Skip this section to try the example with the public demo server.

In your Casdoor, create (or reuse) an organization and an application, and add `casdoor://callback` to the application's **Redirect URLs**. Then fill in the top of [public/electron.js](public/electron.js):

| Name      | Description                                                                 |
|-----------|-----------------------------------------------------------------------------|
| serverUrl | Casdoor server URL                                                          |
| clientId  | Client ID of the application                                                |
| protocol  | The URL scheme of the callback, `casdoor`. If you change it, change it in the `protocols` and `mimeType` of `package.json` too |

## Run

```shell
git clone https://github.com/casdoor/casdoor-electron-example
cd casdoor-electron-example
yarn install
```

| Command        | Description                                                                 |
|----------------|-----------------------------------------------------------------------------|
| `yarn dev`     | Runs the app with the development server of React (hot reload)              |
| `yarn app`     | Builds the page and runs the app                                            |
| `yarn make`    | Builds the installers into `out/` with [Electron Forge](https://www.electronforge.io/) |

Click **Login with Casdoor**. On the demo server, sign in with username `admin` and password `123`; the browser then asks to open the app.

Running the app registers it for the `casdoor://` scheme for your user account.

## Resources

- [Casdoor documentation](https://casdoor.ai/docs/overview)
- [Electron: deep links](https://www.electronjs.org/docs/latest/tutorial/launch-app-from-url-in-another-app)
- [Electron: security](https://www.electronjs.org/docs/latest/tutorial/security)

## License

[Apache-2.0](LICENSE)
