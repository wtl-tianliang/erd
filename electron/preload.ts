import type { AppInfo, Task, TabViewExcludeView, EApi } from "../types";
import { contextBridge, ipcRenderer } from "electron";

const exposed: EApi = {
  getAppInfo(path: string): Promise<AppInfo> {
    return ipcRenderer.invoke("getAppInfo", path);
  },
  updateLog(callback: (message: any) => void): void {
    ipcRenderer.on("updatelog", (_e, data: any) => callback(data));
  },
  updateTask(callback: (tasks: Task[]) => void): void {
    ipcRenderer.on("updateTask", (_e, data: Task[]) => callback(data));
  },
  activeView(viewId: string): void {
    ipcRenderer.invoke("activeView", viewId);
  },
  createTask(info: AppInfo, viewId: string): Promise<Task> {
    return ipcRenderer.invoke("createTask", info, viewId);
  },
  openNewView(): Promise<TabViewExcludeView> {
    return ipcRenderer.invoke("openNewView");
  },
  getTaskById(taskId: string): void {
    ipcRenderer.invoke("getTaskById", taskId);
  },
  destroyTaskById(taskId: string): void {
    ipcRenderer.invoke("destroyTaskById", taskId);
  },
  openUrl(url: string): void {
    ipcRenderer.invoke('openUrl', url)
  },
  shellOpenPath(path: string): void {
    ipcRenderer.invoke("shellOpenPath", path)
  }
}

contextBridge.exposeInMainWorld("EApi", exposed);

function domReady(
  condition: DocumentReadyState[] = ["complete", "interactive"]
) {
  return new Promise((resolve) => {
    if (condition.includes(document.readyState)) {
      resolve(true);
    } else {
      document.addEventListener("readystatechange", () => {
        if (condition.includes(document.readyState)) {
          resolve(true);
        }
      });
    }
  });
}

const safeDOM = {
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find((e) => e === child)) {
      parent.appendChild(child);
    }
  },
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find((e) => e === child)) {
      parent.removeChild(child);
    }
  },
};

/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function useLoading() {
  const className = `loaders-css__square-spin`;
  const styleContent = `
@keyframes square-spin {
  25% { transform: perspective(100px) rotateX(180deg) rotateY(0); }
  50% { transform: perspective(100px) rotateX(180deg) rotateY(180deg); }
  75% { transform: perspective(100px) rotateX(0) rotateY(180deg); }
  100% { transform: perspective(100px) rotateX(0) rotateY(0); }
}
.${className} > div {
  animation-fill-mode: both;
  width: 50px;
  height: 50px;
  background: #fff;
  animation: square-spin 3s 0s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #282c34;
  z-index: 9;
}
    `;
  const oStyle = document.createElement("style");
  const oDiv = document.createElement("div");

  oStyle.id = "app-loading-style";
  oStyle.innerHTML = styleContent;
  oDiv.className = "app-loading-wrap";
  oDiv.innerHTML = `<div class="${className}"><div></div></div>`;

  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle);
      safeDOM.append(document.body, oDiv);
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle);
      safeDOM.remove(document.body, oDiv);
    },
  };
}

// ----------------------------------------------------------------------

const { appendLoading, removeLoading } = useLoading();
domReady().then(appendLoading);

window.onmessage = (ev) => {
  ev.data.payload === "removeLoading" && removeLoading();
};

setTimeout(removeLoading, 4999);
