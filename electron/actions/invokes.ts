import { BrowserWindow, ipcMain, shell } from "electron";
import path from "node:path";
import fs from "node:fs";
import { spawn } from "node:child_process";
import { generateUniqueID } from "../utils";

// @ts-ignore
let win: BrowserWindow;
const extracticon = path.join(__dirname, "../commands/extracticon.exe");

ipcMain.handle("getAppInfo", async (_e, filePath: string) => {
  return new Promise((resolve) => {
    const { name } = path.parse(filePath);
    const id = generateUniqueID(name);
    const dest = path.join(process.cwd(), `icons/${id}.png`);
    const std = spawn(extracticon, [filePath, dest]);
    std.on("close", (code: number) => {
      if (code === 0) {
        const base64 = fs.readFileSync(dest, "base64");
        const icon = `data:image/png;base64,${base64}`;
        resolve({ icon, appId: id, name, exePath: filePath });
      }
    });
  });
});

ipcMain.handle("openUrl", (_e, url: string) => {
  const win = new BrowserWindow({
    width: 1300,
    height: 800,
    center: true,
  });
  win.setMenu(null);
  win.loadURL(url);
});

ipcMain.handle("shellOpenPath", (_e, location: string) => {
  const dirPath = path.dirname(location)
  shell.openPath(dirPath)
});

export default function installActions(_win: BrowserWindow) {
  win = _win;
  // console.log(win)
}
