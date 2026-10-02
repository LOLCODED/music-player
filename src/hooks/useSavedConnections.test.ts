import { act, renderHook } from "@testing-library/react";
import { isSameConnection, useSavedConnections } from "./useSavedConnections";
import { API_VERSION, APP_NAME, SubsonicConfig } from "../config/subsonic";

const STORAGE_KEY = "savedCredentials";

const config: SubsonicConfig = {
  serverUrl: "https://music.example.com",
  username: "listener",
  password: "hunter2",
  token: "deadbeef",
  salt: "cafe",
  appName: APP_NAME,
  apiVersion: API_VERSION,
};

beforeEach(() => localStorage.clear());

it("loads saved connections from storage", () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([{ ...config, id: "1", name: "Home" }]));
  const { result } = renderHook(() => useSavedConnections());
  expect(result.current.connections).toHaveLength(1);
  expect(result.current.loadFailed).toBe(false);
});

it("flags corrupt storage instead of throwing", () => {
  localStorage.setItem(STORAGE_KEY, "{not json");
  const { result } = renderHook(() => useSavedConnections());
  expect(result.current.connections).toEqual([]);
  expect(result.current.loadFailed).toBe(true);
});

it("persists saved connections without the plaintext password", () => {
  const { result } = renderHook(() => useSavedConnections());
  act(() => result.current.saveConnection(config, "Home"));

  expect(result.current.connections[0]).toMatchObject({ name: "Home", token: "deadbeef" });
  const stored = localStorage.getItem(STORAGE_KEY) ?? "";
  expect(stored).toContain("Home");
  expect(stored).not.toContain("hunter2");
});

it("removes a connection from state and storage", () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([{ ...config, id: "1", name: "Home" }]));
  const { result } = renderHook(() => useSavedConnections());
  act(() => result.current.removeConnection("1"));

  expect(result.current.connections).toEqual([]);
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null")).toEqual([]);
});

it("matches connections by server and username", () => {
  expect(isSameConnection(config, { ...config, token: "other" })).toBe(true);
  expect(isSameConnection(config, { ...config, username: "someone-else" })).toBe(false);
});
