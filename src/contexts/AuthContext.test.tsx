import { vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";
import { API_VERSION, APP_NAME, SubsonicConfig } from "../config/subsonic";

const CONFIG_STORAGE_KEY = "subsonicConfig";

type Auth = ReturnType<typeof useAuth>;
type StoredConfig = SubsonicConfig & Record<string, unknown>;

const baseConfig: SubsonicConfig = {
  serverUrl: "https://music.example.com",
  username: "listener",
  password: "hunter2",
  appName: APP_NAME,
  apiVersion: API_VERSION,
};

const tokenConfig: SubsonicConfig = {
  serverUrl: "https://music.example.com",
  username: "session-user",
  token: "deadbeef",
  salt: "cafe",
  appName: APP_NAME,
  apiVersion: API_VERSION,
};

function jsonResponse(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => body,
  } as unknown as Response;
}

function okEnvelope(): unknown {
  return { "subsonic-response": { status: "ok", version: API_VERSION } };
}

function failedEnvelope(code = 40): unknown {
  return {
    "subsonic-response": {
      status: "failed",
      version: API_VERSION,
      error: { code, message: "Wrong username or password" },
    },
  };
}

function stubFetchResolving(body: unknown): void {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => jsonResponse(body))
  );
}

function stubFetchRejecting(): void {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    })
  );
}

function readStored(storage: Storage): StoredConfig | null {
  const raw = storage.getItem(CONFIG_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as StoredConfig) : null;
}

function renderAuth(): { current: Auth | null } {
  const captured: { current: Auth | null } = { current: null };

  const Probe = () => {
    const auth = useAuth();
    captured.current = auth;
    return (
      <div>
        <span data-testid="loading">{String(auth.loading)}</span>
        <span data-testid="authenticated">{String(auth.isAuthenticated)}</span>
        <span data-testid="username">{auth.subsonicConfig?.username ?? ""}</span>
      </div>
    );
  };

  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>
  );
  return captured;
}

async function waitForInit(): Promise<void> {
  await waitFor(() =>
    expect(screen.getByTestId("loading")).toHaveTextContent("false")
  );
}

function expectAuthenticated(value: boolean): void {
  expect(screen.getByTestId("authenticated")).toHaveTextContent(String(value));
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("session restore on mount", () => {
  it("restores a config held only in sessionStorage", async () => {
    sessionStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(tokenConfig));
    stubFetchResolving(okEnvelope());

    renderAuth();
    await waitForInit();

    expectAuthenticated(true);
    expect(readStored(sessionStorage)).toMatchObject({
      username: "session-user",
      token: "deadbeef",
      salt: "cafe",
    });
    expect(localStorage.getItem(CONFIG_STORAGE_KEY)).toBeNull();
  });

  it("prefers the sessionStorage config over a stale localStorage one", async () => {
    localStorage.setItem(
      CONFIG_STORAGE_KEY,
      JSON.stringify({ ...tokenConfig, username: "remembered-user" })
    );
    sessionStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(tokenConfig));
    stubFetchResolving(okEnvelope());

    renderAuth();
    await waitForInit();

    expectAuthenticated(true);
    expect(screen.getByTestId("username")).toHaveTextContent("session-user");
  });

  it("migrates a legacy password config to token+salt without the password", async () => {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(baseConfig));
    stubFetchResolving(okEnvelope());

    renderAuth();
    await waitForInit();

    expectAuthenticated(true);
    const stored = readStored(localStorage);
    expect(stored).not.toBeNull();
    expect(stored).toHaveProperty("token");
    expect(stored).toHaveProperty("salt");
    expect(stored).not.toHaveProperty("password");
  });

  it("discards a stored config with no usable credentials", async () => {
    const { password: _password, ...credentialless } = baseConfig;
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(credentialless));
    stubFetchResolving(okEnvelope());

    renderAuth();
    await waitForInit();

    expectAuthenticated(false);
    expect(localStorage.getItem(CONFIG_STORAGE_KEY)).toBeNull();
  });

  it("clears both stores when the server rejects the credentials", async () => {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(tokenConfig));
    stubFetchResolving(failedEnvelope());

    renderAuth();
    await waitForInit();

    expectAuthenticated(false);
    expect(localStorage.getItem(CONFIG_STORAGE_KEY)).toBeNull();
    expect(sessionStorage.getItem(CONFIG_STORAGE_KEY)).toBeNull();
  });

  it("keeps stored credentials when the server is unreachable", async () => {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(tokenConfig));
    stubFetchRejecting();

    renderAuth();
    await waitForInit();

    expectAuthenticated(false);
    expect(readStored(localStorage)).toMatchObject({ token: "deadbeef" });
  });
});

describe("login", () => {
  async function login(
    captured: { current: Auth | null },
    rememberMe: boolean
  ): Promise<boolean> {
    let result = false;
    await act(async () => {
      result = await captured.current!.login(baseConfig, rememberMe);
    });
    return result;
  }

  it("persists to localStorage only when remember me is on", async () => {
    stubFetchResolving(okEnvelope());
    const captured = renderAuth();
    await waitForInit();

    expect(await login(captured, true)).toBe(true);

    expectAuthenticated(true);
    expect(localStorage.getItem(CONFIG_STORAGE_KEY)).not.toBeNull();
    expect(sessionStorage.getItem(CONFIG_STORAGE_KEY)).toBeNull();
  });

  it("persists to sessionStorage only when remember me is off", async () => {
    stubFetchResolving(okEnvelope());
    const captured = renderAuth();
    await waitForInit();

    expect(await login(captured, false)).toBe(true);

    expectAuthenticated(true);
    expect(sessionStorage.getItem(CONFIG_STORAGE_KEY)).not.toBeNull();
    expect(localStorage.getItem(CONFIG_STORAGE_KEY)).toBeNull();
  });

  it.each([
    { rememberMe: true, storage: () => localStorage },
    { rememberMe: false, storage: () => sessionStorage },
  ])(
    "never persists the plaintext password (rememberMe: $rememberMe)",
    async ({ rememberMe, storage }) => {
      stubFetchResolving(okEnvelope());
      const captured = renderAuth();
      await waitForInit();

      await login(captured, rememberMe);

      const stored = readStored(storage());
      expect(stored).not.toBeNull();
      expect(stored).toHaveProperty("token");
      expect(stored).toHaveProperty("salt");
      expect(stored).not.toHaveProperty("password");
      expect(JSON.stringify(stored)).not.toContain("hunter2");
    }
  );

  it("returns false and stores nothing when the server rejects the credentials", async () => {
    stubFetchResolving(failedEnvelope());
    const captured = renderAuth();
    await waitForInit();

    expect(await login(captured, true)).toBe(false);

    expectAuthenticated(false);
    expect(localStorage.getItem(CONFIG_STORAGE_KEY)).toBeNull();
    expect(sessionStorage.getItem(CONFIG_STORAGE_KEY)).toBeNull();
  });
});

describe("logout", () => {
  it("clears both stores and drops the session", async () => {
    stubFetchResolving(okEnvelope());
    const captured = renderAuth();
    await waitForInit();

    await act(async () => {
      await captured.current!.login(baseConfig, true);
    });
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(tokenConfig));
    sessionStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(tokenConfig));

    act(() => captured.current!.logout());

    expectAuthenticated(false);
    expect(localStorage.getItem(CONFIG_STORAGE_KEY)).toBeNull();
    expect(sessionStorage.getItem(CONFIG_STORAGE_KEY)).toBeNull();
    expect(captured.current!.subsonicService).toBeNull();
  });
});
