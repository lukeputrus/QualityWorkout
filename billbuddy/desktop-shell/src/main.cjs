// BillBuddy desktop shell. This is intentionally thin: the real
// application (UI, API, database) is the same Express+SQLite server and
// React app used for LAN/companion access - this file just boots that
// server in-process and points a native window at it, so the packaged app
// works fully offline with no separate backend to install.
const { app, BrowserWindow } = require("electron");
const path = require("node:path");

const PORT = process.env.PORT || "4000";

// Keep the SQLite file in Electron's per-OS app-data directory rather than
// next to the installed app (which is often read-only once packaged).
process.env.BILLBUDDY_DATA_DIR =
  process.env.BILLBUDDY_DATA_DIR || path.join(app.getPath("userData"), "data");
process.env.PORT = PORT;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 1000,
    minHeight: 640,
    title: "BillBuddy",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow.loadURL(`http://localhost:${PORT}`);
}

app.whenReady().then(async () => {
  // server/dist is built as an ES module (see server/package.json's
  // "type": "module"), so it must be loaded with a dynamic import() even
  // from this CommonJS main process - a plain require() cannot load ESM.
  await import(path.join(__dirname, "..", "..", "server", "dist", "index.js"));
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
