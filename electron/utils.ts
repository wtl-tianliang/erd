import { type BrowserView } from "electron";
import path from "node:path";
import { createHash } from "crypto";

export function generateUniqueID(input: string): string {
  const hash = createHash("sha256");
  hash.update(input);
  return hash.digest("hex").slice(0, 16);
}

export function resolvePath(_path: string): string {
  return path.join(process.env.DIST, _path);
}

export function loadLanguage(name: string) {
  return import(`../locales/${name}.json`).catch(() => {
    return import("../locales/en_US.json");
  });
}

export function createOutput(view?: BrowserView) {
  return (message: any) => {
    if (view) {
      view.webContents.send("updatelog", message);
    } else {
      console.log(message);
    }
  };
}
