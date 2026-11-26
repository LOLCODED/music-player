import { act, renderHook, waitFor } from "@testing-library/react";
import { useIsCellular } from "./useIsCellular";

const network = vi.hoisted(() => ({
  status: { connected: true, connectionType: "wifi" },
  listener: null as ((status: unknown) => void) | null,
}));

vi.mock("@capacitor/network", () => ({
  Network: {
    getStatus: () => Promise.resolve(network.status),
    addListener: (_: string, handler: (status: unknown) => void) => {
      network.listener = handler;
      return Promise.resolve({ remove: () => Promise.resolve() });
    },
  },
}));

describe("useIsCellular", () => {
  it("reports the current connection and follows changes", async () => {
    network.status = { connected: true, connectionType: "cellular" };
    const { result } = renderHook(() => useIsCellular());
    await waitFor(() => expect(result.current).toBe(true));

    act(() => network.listener?.({ connected: true, connectionType: "wifi" }));
    expect(result.current).toBe(false);
  });
});
