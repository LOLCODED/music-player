import { vi } from "vitest";
import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MediaCard from "./MediaCard";

const title = "Night Drive";
const subtitle = "The Testers";
const imageUrl = "https://music.example.com/cover/co-1";

function renderCard(overrides: Partial<ComponentProps<typeof MediaCard>> = {}) {
  const onClick = vi.fn();
  const onPlay = vi.fn();
  const { container } = render(
    <MediaCard
      imageUrl={imageUrl}
      title={title}
      subtitle={subtitle}
      onClick={onClick}
      onPlay={onPlay}
      {...overrides}
    />
  );
  const card = container.querySelector<HTMLElement>(".album-card");
  if (!card) throw new Error("MediaCard did not render a card element");
  return { card, onClick, onPlay, user: userEvent.setup() };
}

describe("MediaCard", () => {
  it("renders the title, subtitle and a lazily loaded image", () => {
    renderCard();

    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(subtitle)).toBeInTheDocument();

    const image = screen.getByAltText(title);
    expect(image).toHaveAttribute("src", imageUrl);
    expect(image).toHaveAttribute("loading", "lazy");
  });

  it("is reachable by keyboard", async () => {
    const { card, user } = renderCard();

    await user.tab();

    expect(card).toHaveFocus();
  });

  it.each(["{Enter}", " "])("activates on %s", async (key) => {
    const { card, onClick, user } = renderCard();
    card.focus();

    await user.keyboard(key);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not activate on an unrelated key", async () => {
    const { card, onClick, user } = renderCard();
    card.focus();

    await user.keyboard("{ArrowRight}");

    expect(onClick).not.toHaveBeenCalled();
  });

  it("fires onClick when the card body is clicked", async () => {
    const { card, onClick, onPlay, user } = renderCard();

    await user.click(card);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onPlay).not.toHaveBeenCalled();
  });

  it("does not bubble the play button click to the card", async () => {
    const { onClick, onPlay, user } = renderCard();

    await user.click(screen.getByRole("button", { name: `Play ${title}` }));

    expect(onPlay).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("does not bubble the star button click to the card", async () => {
    const onToggleStar = vi.fn();
    const { onClick, user } = renderCard({ onToggleStar });

    await user.click(screen.getByRole("button", { name: "Add to favorites" }));

    expect(onToggleStar).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("does not bubble the delete button click to the card", async () => {
    const onDelete = vi.fn();
    const { onClick, user } = renderCard({ onDelete });

    await user.click(screen.getByRole("button", { name: `Delete ${title}` }));

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("omits the optional buttons when no handler is given", () => {
    renderCard();

    expect(
      screen.queryByRole("button", { name: "Add to favorites" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: `Delete ${title}` })
    ).not.toBeInTheDocument();
  });
});
