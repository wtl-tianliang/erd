import { app, BrowserWindow } from "electron";
import { net, protocol } from "electron";
import path from "node:path";
import { pathToFileURL } from "url";
import { initStore } from "./store";
import initBaseInvokes from "./actions/invokes";
import initViewsActions from "./actions/views";
import initTaskActions from "./actions/task";

process.env.DIST = path.join(__dirname, "../dist");
process.env.PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, "../public");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];

function createWindow() {
  const win = new BrowserWindow({
    icon: path.join(process.env.PUBLIC, "icon.png"),
    width: 1300,
    height: 800,
    center: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.setMenu(null);
  // win.webContents.openDevTools()

  if (VITE_DEV_SERVER_URL) {
    win.webContents.loadURL(`${VITE_DEV_SERVER_URL}#/views`);
  } else {
    // win.loadFile(path.join(process.env.DIST, "index.html"));
    win.webContents.loadURL(`erdp://wk.oddtools.cn/#/views`);
  }

  return win;
}

app.on("window-all-closed", () => {
  app.quit();
});

function registerProtocol(): void {
  protocol.handle("erdp", (req) => {
    const { pathname } = new URL(req.url);
    if (pathname === "/") {
      const _temp = path.join(process.env.DIST, "index.html");
      const _path = pathToFileURL(_temp).toString();
      return net.fetch(_path);
    }
    const _temp = path.join(process.env.DIST, pathname);
    const _path = pathToFileURL(_temp).toString();
    return net.fetch(_path);
  });
}

// Register erdp(element remote debugge protocol) protocol
protocol.registerSchemesAsPrivileged([
  {
    scheme: "erdp",
    privileges: { bypassCSP: true, standard: true, secure: true },
  },
]);

app.whenReady().then(() => {
  registerProtocol();
  const win = createWindow();
  initStore();
  initBaseInvokes(win);
  initViewsActions(win);
  initTaskActions(win);
});
