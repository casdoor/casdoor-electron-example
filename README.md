# casdoor-electron-example

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) and [Electron](https://www.electronjs.org/).

## Init example

You need to init requires 6 parameters, which are all string type:

| Name                 | Description                                                                                      | Path                   |
| -------------------- | ------------------------------------------------------------------------------------------------ | ---------------------- |
| serverUrl            | your Casdoor server URL                                                                          | `src/App.js`         |
| clientId             | the Client ID of your Casdoor application                                                        | `src/App.js`         |
| appName              | the name of your Casdoor application                                                             | `src/App.js`         |
| redirectPath         | the path of the redirect URL for your Casdoor application, will be `/callback` if not provided | `src/App.js`         |
| clientSecret         | the Client Secret of your Casdoor application                                                   | `src/App.js`         |
| casdoorServiceDomain | your Casdoor server URL                                                                          | `public/electron.js` |

If you don't set these parameters, this project will use the  [Casdoor online demo]( https://door.casdoor.com) as the defult Casdoor server and use the [Casnode](https://door.casdoor.com/applications/app-casnode) as the default Casdoor application.

## Available Scripts

In the project directory, you can run:

### `npm run dev` or `yarn dev`

Builds the electron app and run this app.
### `npm run make` or `yarn make`
 Package and distribute your application.
 It will create the `out` folder where your package will be located:
`// Example for macOS
    out/
    ├── out/make/zip/darwin/x64/my-electron-app-darwin-x64-1.0.0.zip
    ├── ...
    └── out/my-electron-app-darwin-x64/my-electron-app.app/Contents/MacOS/my-electron-ap`
    
    