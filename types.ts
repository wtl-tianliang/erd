import { type BrowserView } from "electron";

export type AppInfo = {
  appId: string;
  name: string;
  icon: string;
  exePath: string;
};

export type TabView = {
  viewId: string;
  title: string;
  icon: string;
  view: BrowserView;
};

export type BackendTask = {
  taskId: string;
  appId: AppInfo["appId"];
  windowPort: number;
  nodePort: number;
};

export type TabViewExcludeView = Omit<TabView, "view">;

export type Task = TabViewExcludeView & Partial<BackendTask>;

export type EApi = {
  getAppInfo(path: string): Promise<AppInfo>;
  activeView(viewId: TabView["viewId"]): void;
  createTask(info: AppInfo, viewId: TabView["viewId"]): Promise<Task>;
  openNewView(): Promise<TabViewExcludeView>;
  updateLog(callback: (message: any) => void): void;
  updateTask(callback: (data: Task[]) => void): void;
  getTaskById(taskId: BackendTask["taskId"]): void;
  destroyTaskById(taskId: BackendTask["taskId"]): void;
  openUrl(url: string): void;
  shellOpenPath(path: string): void;
};

export type BrowserInspectItem = {
  devtoolsFrontendUrl: string;
  id: string;
  title: string;
  type: "page";
  url: string;
  webSocketDebuggerUrl: string;
};

export type NodeInspectItem = {
  devtoolsFrontendUrl: string;
  devtoolsFrontendUrlCompat: string;
  id: string;
  title: string;
  type: "node";
  url: string;
  webSocketDebuggerUrl: string;
};

export type InspectItem = {
  id: string;
  type: "page" | "node";
  title: string;
  url: string;
  webSocketDebuggerUrl: string;
  devtoolsFrontendUrl: string;
};

declare global {
  interface Window {
    EApi: EApi;
  }
}
