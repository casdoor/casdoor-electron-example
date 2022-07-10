# casdoor-electron-example

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) and [Electron](https://www.electronjs.org/).

## Init example

You need to init requires 7 parameters, which are all string type:

| Name                 | Must | Description                                                                                      | Path                   |
| -------------------- | ---- | ------------------------------------------------------------------------------------------------ | ---------------------- |
| serverUrl            | Yes  | your Casdoor server URL                                                                          | `src/App.js`         |
| clientId             | Yes  | the Client ID of your Casdoor application                                                        | `src/App.js`         |
| appName              | Yes  | the name of your Casdoor application                                                             | `src/App.js`         |
| organizationName     | Yes  | the name of the Casdoor organization connected with your Casdoor application                     | `src/App.js`         |
| redirectPath         | No   | the path of the redirect URL for your Casdoor application, will be `/callback` if not provided | `src/App.js`         |
| clientSecret         | Yes  | the Client Secret of your Casdoor application                                                   | `src/App.js`         |
| casdoorServiceDomain | Yes  | your Casdoor server URL                                                                          | `public/electron.js` |

The first five parameters are parameters of [casdoor-js-sdk](https://github.com/casdoor/casdoor-js-sdk).

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Builds the electron app and run this app.
