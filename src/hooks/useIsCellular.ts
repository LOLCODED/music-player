import { useEffect, useState } from "react";
import { Network, type ConnectionStatus } from "@capacitor/network";

const isCellular = (status: ConnectionStatus) => status.connectionType === "cellular";

export function useIsCellular(): boolean {
  const [cellular, setCellular] = useState(false);

  useEffect(() => {
    let active = true;
    Network.getStatus()
      .then((status) => active && setCellular(isCellular(status)))
      .catch(() => {});
    const handle = Network.addListener("networkStatusChange", (status) =>
      setCellular(isCellular(status))
    );
    return () => {
      active = false;
      void handle.then((h) => h.remove()).catch(() => {});
    };
  }, []);

  return cellular;
}
