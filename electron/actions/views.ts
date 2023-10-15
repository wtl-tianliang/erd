import type { BrowserWindow } from "electron";
import { ipcMain } from "electron";
import ViewsManager from "../classes/ViewsManager";
import { TabView, TabViewExcludeView } from "../../types";

let win: BrowserWindow;
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const views = new ViewsManager();

export const destroyView = (viewId: string) => {
  views.destroyView(viewId);
};

export const getViewByViewId = (viewId: string) => {
  return views.getView(viewId);
};

ipcMain.handle("openNewView", (): Promise<TabViewExcludeView> => {
  const url = VITE_DEV_SERVER_URL
    ? `${VITE_DEV_SERVER_URL}#/`
    : "erdp://wk.oddtools.cn/#/";

  const BOUND_OF_TOP = 40;
  return new Promise((resolve) => {
    const info: TabView = views.createView(url);
    const { view, viewId, title, icon } = info;
    win.setBrowserView(view);
    // position
    view.setBounds({
      x: 0,
      y: BOUND_OF_TOP,
      width: 1280,
      height: 800 - BOUND_OF_TOP * 2, // Multiply by 2, this algorithm might be a bug of electron
    });
    resolve({ viewId, title, icon });
  });
});

ipcMain.handle("activeView", (_e, viewId: string) => {
  const newView = views.getView(viewId);
  if (newView) {
    win.setBrowserView(newView.view);
  }
});

export default function initActions(_win: BrowserWindow) {
  win = _win;
}
