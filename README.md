# casdoor-electron-example

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) and [Electron](https://www.electronjs.org/).

## Init example

You need to init requires 7 parameters, which are all string type:

| Name                 | Description                                                                                      | Path                   |
| -------------------- | ------------------------------------------------------------------------------------------------ | ---------------------- |
| serverUrl            | your Casdoor server URL                                                                          | `src/App.js`         |
| clientId             | the Client ID of your Casdoor application                                                        | `src/App.js`         |
| appName              | the name of your Casdoor application                                                             | `src/App.js`         |
| organizationName     | the name of the Casdoor organization connected with your Casdoor application                     | `src/App.js`         |
| redirectPath         | the path of the redirect URL for your Casdoor application, will be `/callback` if not provided | `src/App.js`         |
| clientSecret         | the Client Secret of your Casdoor application                                                   | `src/App.js`         |
| casdoorServiceDomain | your Casdoor server URL                                                                          | `public/electron.js` |

The first five parameters are parameters of [casdoor-js-sdk](https://github.com/casdoor/casdoor-js-sdk).

If you don't set these parameters, this project will use the  [Casdoor online demo]( https://door.casdoor.com) as the defult Casdoor server and use the [Casnode](https://door.casdoor.com/applications/app-casnode) as the default Casdoor application.

## Available Scripts

In the project directory, you can run:

### `npm run dev` or `yarn dev`

Builds the electron app and run this app.
