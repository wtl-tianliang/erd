import { BrowserView } from "electron";
import path from "node:path";
import { type TabView } from "../../types";

export default class TabManager {
  map: Map<string, TabView>;
  constructor() {
    this.map = new Map<string, TabView>();
  }
  createView(url: string): TabView {
    const viewId = `view_${Date.now()}`;
    const view = new BrowserView({
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
      },
    });
    // view.webContents.openDevTools();

    // cors
    view.webContents.session.webRequest.onHeadersReceived(
      (details, callback) => {
        callback({
          responseHeaders: {
            ...details.responseHeaders,
            "Access-Control-Allow-Origin": ["*"],
          },
        });
      }
    );

    view.setAutoResize({
      width: true,
      height: true,
      horizontal: true,
      vertical: true,
    });

    url += url.indexOf("?") > -1 ? `&viewId=${viewId}` : `?viewId=${viewId}`;
    view.webContents.loadURL(url);

    const info: TabView = { title: "", viewId, view, icon: "" };
    this.map.set(viewId, info);
    return info;
  }
  getView(id: string) {
    return this.map.get(id);
  }
  destroyView(id: string) {
    if (this.map.has(id)) {
      this.map.delete(id);
    }
  }
}
