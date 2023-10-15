import type {
  BrowserInspectItem,
  NodeInspectItem,
  InspectItem,
} from "../../types";

import axios from "axios";

type MixedInspectItem = BrowserInspectItem | NodeInspectItem;
export async function requestInspects(port: number): Promise<InspectItem[]> {
  const url = `http://127.0.0.1:${port}/json`;
  const { data = [] } = await axios.get<MixedInspectItem[]>(url);
  const result: InspectItem[] = data.map((item) => {
    return {
      id: item.id,
      url: item.url,
      title: item.title,
      type: item.type,
      devtoolsFrontendUrl: item.devtoolsFrontendUrl,
      webSocketDebuggerUrl: item.webSocketDebuggerUrl,
    };
  });
  return result;
}
