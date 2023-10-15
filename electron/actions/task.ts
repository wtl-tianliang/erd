import { BrowserWindow, ipcMain } from "electron";
import type {
  BackendTask,
  Task,
  AppInfo,
  TabViewExcludeView,
} from "../../types";
import getProt from "get-port";
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { getViewByViewId } from "./views";
import { generateUniqueID, createOutput } from "../utils";

let win: BrowserWindow;
const tasks = new Map<string, Task>();
const backProcress = new Map<string, ChildProcessWithoutNullStreams>();

function updateTask() {
  const list = Array.from(tasks.values());
  win.webContents.send("updateTask", list);
}

ipcMain.handle(
  "createTask",
  async (_e, info: AppInfo, viewId: string): Promise<Task> => {
    const { exePath, appId } = info;
    const windowPort = await getProt();
    const nodePort = await getProt();
    const taskId: string = generateUniqueID(
      `${appId}_${windowPort}_${nodePort}`
    );

    const tabView = getViewByViewId(viewId);
    const view = tabView?.view;
    const output = createOutput(view);
    const luanchParams = [
      `--remote-debugging-port=${windowPort}`,
      `--inspect=${nodePort}`,
    ];
    const sp = spawn(exePath, luanchParams);

    output(info.name);
    const startLog = `[ERD] node:${nodePort} window:${windowPort}`;
    output(startLog);

    sp.stdout.on("data", (data) => output(data.toString()));
    sp.stderr.on("data", (data) => output(data.toString()));
    sp.on("error", (err: Error) => output(`ERROR: ${err.message}`));
    sp.on("close", (code) => {
      output(`[ERD] STOP`)
      console.log(`[ERD] STOP ${code}`)
    });

    backProcress.set(taskId, sp);

    const back: BackendTask = {
      appId: info.appId,
      taskId,
      windowPort,
      nodePort,
    };
    const tab: TabViewExcludeView = {
      viewId,
      title: info.name,
      icon: info.icon,
    };

    const task: Task = Object.assign({}, back, tab);
    tasks.set(taskId, task);

    // Emit update event
    updateTask();

    return task;
  }
);

ipcMain.handle("getTaskById", (_e, taskId: string) => {
  return tasks.get(taskId);
});

ipcMain.handle("destroyTaskById", (_e, taskId: string) => {
  // TODO: sp.kill() is invalidate on windows

  if (taskId) {
    const task = tasks.get(taskId);
    const viewId = task!.viewId;
    const tabView = getViewByViewId(viewId);
    const view = tabView?.view;
    const sp = backProcress.get(taskId);
    if (sp && sp.killed === false) {
      sp.kill();
    }
    if (view) {
      win.removeBrowserView(view);
    }
    tasks.delete(taskId);
    updateTask();
  }
});

export default function installActions(_win: BrowserWindow) {
  win = _win;
}
