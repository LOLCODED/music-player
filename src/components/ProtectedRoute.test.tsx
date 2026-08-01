import { vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

const authState = vi.hoisted(() => ({
  isAuthenticated: false,
  loading: false,
}));

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => authState,
}));

function renderProtected() {
  return render(
    <MemoryRouter initialEntries={["/albums"]}>
      <Routes>
        <Route path="/login" element={<div>login page</div>} />
        <Route
          path="/albums"
          element={
            <ProtectedRoute>
              <div>albums page</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  authState.isAuthenticated = false;
  authState.loading = false;
});

describe("ProtectedRoute", () => {
  it("shows a spinner while auth is still loading", () => {
    authState.loading = true;

    const { container } = renderProtected();

    expect(container.querySelector(".centered-spinner")).not.toBeNull();
    expect(container.querySelector(".spinner")).not.toBeNull();
    expect(screen.queryByText("albums page")).not.toBeInTheDocument();
    expect(screen.queryByText("login page")).not.toBeInTheDocument();
  });

  it("redirects to the login route when unauthenticated", () => {
    renderProtected();

    expect(screen.getByText("login page")).toBeInTheDocument();
    expect(screen.queryByText("albums page")).not.toBeInTheDocument();
  });

  it("renders the protected children when authenticated", () => {
    authState.isAuthenticated = true;

    renderProtected();

    expect(screen.getByText("albums page")).toBeInTheDocument();
    expect(screen.queryByText("login page")).not.toBeInTheDocument();
  });
});
