import { vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Modal from "./Modal";

function renderModal(showCloseButton = false) {
  const onClose = vi.fn();
  const { container, unmount } = render(
    <Modal title="Create playlist" onClose={onClose} showCloseButton={showCloseButton}>
      <input aria-label="Playlist name" />
      <button>Save</button>
    </Modal>
  );
  const overlay = container.querySelector<HTMLElement>(".modal-overlay");
  if (!overlay) throw new Error("Modal did not render an overlay");
  return { overlay, onClose, unmount, user: userEvent.setup() };
}

describe("Modal", () => {
  it("exposes dialog semantics and labels itself with the title", () => {
    renderModal();

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleName("Create playlist");
  });

  it("focuses the first form field", () => {
    renderModal();

    expect(screen.getByLabelText("Playlist name")).toHaveFocus();
  });

  it("closes on Escape", async () => {
    const { onClose, user } = renderModal();

    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("stops listening for Escape after unmount", async () => {
    const { onClose, unmount, user } = renderModal();

    unmount();
    await user.keyboard("{Escape}");

    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes when the overlay is clicked", async () => {
    const { overlay, onClose, user } = renderModal();

    await user.click(overlay);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("stays open when the dialog box is clicked", async () => {
    const { onClose, user } = renderModal();

    await user.click(screen.getByRole("dialog"));
    await user.click(screen.getByLabelText("Playlist name"));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes from the optional close button", async () => {
    const { onClose, user } = renderModal(true);

    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
