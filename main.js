// main.js
// Modules to control application life and create native browser window
const { app, BrowserWindow } = require("electron");
const { ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const createHash = require("hash-generator");
const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      //preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  // and load the index.html of the app.
  mainWindow.loadFile("static/index.html");
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
};
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// listen to application messages
ipcMain.on("app:generate", (event, data) => {
  console.log("Generating pdf...");
  const url = data.url;
  const filename = data.filename;
  const canvases = Array.isArray(data.canvases)
    ? data.canvases
    : JSON.parse(data.canvases);
  console.log(data, typeof data);
  const hash = createHash(16);
  const hashFilename = `${hash}${filename}.pdf`;
  import("./cocktail.mjs").then((Cocktail) => {
    Cocktail.default(url, canvases, filename, hashFilename).then((doc) => {
      console.log("Done request for file: ", hashFilename);
      doc.pipe(
        fs.createWriteStream(path.join(__dirname, `static/${hashFilename}`))
      );
    });
  });
  event.returnValue = hashFilename;
});
ipcMain.on("app:progress", (event, hashFilename) => {
  console.log("Getting progress");
  const cashFilename = `${hashFilename}.json`;
  try {
    const cash = fs.readFileSync(
      path.join(__dirname, `static/${cashFilename}`),
      "utf8"
    );
    event.returnValue = cash;
  } catch (e) {
    console.log(e);
    event.returnValue = {
      progress: 0,
    };
  }
});
ipcMain.on("app:pdf", (event, hashFilename) => {
  console.log("Getting pdf");
  try {
    const pdf = fs.readFileSync(
      path.join(__dirname, `static/${hashFilename}`), 'base64');
    event.returnValue = pdf;
  } catch (e) {
    console.log(e);
    event.returnValue = null;
  }
});
ipcMain.on("app:clear", (event, hashFilename) => {
  console.log("Clearing pdf");
  try {
    fs.unlinkSync(path.join(__dirname, `static/${hashFilename}`));
    const cashFilename = `${hashFilename}.json`;
    fs.unlinkSync(path.join(__dirname, `static/${cashFilename}`));
    event.returnValue = true;
  } catch (e) {
    console.log(e);
    event.returnValue = false;
  }
});

/*const { app, BrowserWindow } = require("electron");

import("./index.mjs")
.then(server => {
    console.log("Done importing server")
})
.catch(e => {
    console.log(e)
})

const PORT = process.env.PORT || 5000;
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL(`http://localhost:${PORT}`);
  mainWindow.on("closed", function () {
    mainWindow = null;
  });
}

app.on("ready", createWindow);

app.on("resize", function (e, x, y) {
  mainWindow.setSize(x, y);
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  if (mainWindow === null) {
    createWindow();
  }
});*/
