import { act, renderHook, waitFor } from "@testing-library/react";
import { usePlaylistCover } from "./usePlaylistCover";
import { getNativeSession, setNativeSession } from "../utils/nativeSession";
import { SubsonicConfig } from "../config/subsonic";

const config: SubsonicConfig = {
  serverUrl: "https://music.example", username: "me", token: "t", salt: "s",
  appName: "test", apiVersion: "1.16.1",
};
const file = new File(["img"], "cover.png", { type: "image/png" });

function respond(status: number, body: unknown = {}, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers });
}

describe("usePlaylistCover", () => {
  const fetchMock = vi.fn();
  const onUploaded = vi.fn();
  const onError = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    fetchMock.mockReset();
    onUploaded.mockReset();
    onError.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  const setup = () =>
    renderHook(() => usePlaylistCover(config, onUploaded, onError)).result;

  it("asks for the password once, then uploads and keeps the session", async () => {
    fetchMock
      .mockResolvedValueOnce(respond(200, { token: "jwt1" }))
      .mockResolvedValueOnce(respond(200, {}, { "x-nd-authorization": "Bearer jwt2" }));
    const result = setup();

    act(() => result.current.chooseFile("pl1", file));
    expect(result.current.state.step).toBe("needsPassword");
    expect(fetchMock).not.toHaveBeenCalled();

    await act(() => result.current.submitPassword("secret"));

    expect(fetchMock.mock.calls[0][0]).toBe("https://music.example/auth/login");
    const [uploadUrl, uploadInit] = fetchMock.mock.calls[1];
    expect(uploadUrl).toBe("https://music.example/api/playlist/pl1/image");
    expect(uploadInit.headers["x-nd-authorization"]).toBe("Bearer jwt1");
    expect((uploadInit.body as FormData).get("image")).toBeInstanceOf(File);
    expect(onUploaded).toHaveBeenCalledWith("pl1");
    expect(getNativeSession(config.serverUrl, "me")).toBe("jwt2");
    expect(localStorage.getItem("navidromeSessions")).not.toContain("secret");
  });

  it("uploads straight away with a saved session", async () => {
    setNativeSession(config.serverUrl, "me", "jwt1");
    fetchMock.mockResolvedValueOnce(respond(200));
    const result = setup();

    act(() => result.current.chooseFile("pl1", file));
    await waitFor(() => expect(onUploaded).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("drops an expired session and asks for the password again", async () => {
    setNativeSession(config.serverUrl, "me", "old");
    fetchMock.mockResolvedValueOnce(respond(401));
    const result = setup();

    act(() => result.current.chooseFile("pl1", file));
    await waitFor(() => expect(result.current.state.step).toBe("needsPassword"));
    expect(getNativeSession(config.serverUrl, "me")).toBeNull();
    expect(onUploaded).not.toHaveBeenCalled();
  });

  it("shows a wrong password inline without uploading", async () => {
    fetchMock.mockResolvedValueOnce(respond(401));
    const result = setup();

    act(() => result.current.chooseFile("pl1", file));
    await act(() => result.current.submitPassword("nope"));

    expect(result.current.state).toMatchObject({ step: "needsPassword", error: "Wrong password" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("reports a refused upload as an error, not a sign-in prompt", async () => {
    setNativeSession(config.serverUrl, "me", "jwt1");
    fetchMock.mockResolvedValueOnce(respond(403));
    const result = setup();

    act(() => result.current.chooseFile("pl1", file));
    await waitFor(() => expect(onError).toHaveBeenCalled());
    expect(result.current.state.step).toBe("idle");
  });
});
