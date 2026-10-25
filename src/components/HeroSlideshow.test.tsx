import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import HeroSlideshow from "./HeroSlideshow";

const images = [
  { src: "/first.jpg", caption: "First caption" },
  { src: "/second.jpg", caption: "Second caption" },
];

describe("HeroSlideshow", () => {
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("loads the first slide with high priority and lets visitors choose a slide", () => {
    const { container } = render(<HeroSlideshow images={images} />);
    const firstImage = container.querySelector("img");

    expect(firstImage).toHaveAttribute("src", "/first.jpg");
    expect(firstImage).toHaveAttribute("fetchpriority", "high");
    expect(screen.getByText("First caption")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Go to slide 2" }));

    expect(container.querySelector('img[src="/second.jpg"]')).not.toBeNull();
    expect(screen.getByRole("button", { name: "Go to slide 2" })).toHaveAttribute("aria-pressed", "true");
  });

  it("advances automatically every six seconds", () => {
    vi.useFakeTimers();
    const { container } = render(<HeroSlideshow images={images} />);

    act(() => {
      vi.advanceTimersByTime(6000);
    });

    expect(container.querySelector('img[src="/second.jpg"]')).not.toBeNull();
  });

  it("pauses automatic advance while the document is hidden", () => {
    vi.useFakeTimers();
    const visibility = vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    const { container } = render(<HeroSlideshow images={images} />);

    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(container.querySelector('img[src="/second.jpg"]')).toBeNull();

    visibility.mockReturnValue(false);
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
      vi.advanceTimersByTime(6000);
    });

    expect(container.querySelector('img[src="/second.jpg"]')).not.toBeNull();
  });

  it("does not auto-advance when reduced motion is preferred", () => {
    vi.useFakeTimers();
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    vi.spyOn(window, "matchMedia").mockReturnValue({ ...mediaQuery, matches: true });
    const { container } = render(<HeroSlideshow images={images} />);

    act(() => {
      vi.advanceTimersByTime(6000);
    });

    expect(container.querySelector('img[src="/first.jpg"]')).not.toBeNull();
  });
});
