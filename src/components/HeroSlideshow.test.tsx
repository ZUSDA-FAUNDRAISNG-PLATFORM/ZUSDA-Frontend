import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import HeroSlideshow from "./HeroSlideshow";

const images = [
  { src: "/first.jpg", caption: "First caption", sortOrder: 1 },
  { src: "/second.jpg", caption: "Second caption", sortOrder: 2 },
];

describe("HeroSlideshow", () => {
  afterEach(() => {
    localStorage.removeItem("zusda-hero-slides-v1");
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

  it("renders the cached slide immediately while fresh CMS slides are pending", () => {
    localStorage.setItem("zusda-hero-slides-v1", JSON.stringify([images[0]]));

    const { container } = render(<HeroSlideshow images={[]} cmsReady={false} fallbackImage="/settings.jpg" />);

    expect(container.querySelector('img[src="/first.jpg"]')).not.toBeNull();
    expect(container.querySelector('img[src="/settings.jpg"]')).toBeNull();
  });

  it("replaces cached slides as soon as the CMS responds", () => {
    localStorage.setItem("zusda-hero-slides-v1", JSON.stringify([images[0]]));

    const { container, rerender } = render(
      <HeroSlideshow images={[]} cmsReady={false} fallbackImage="/settings.jpg" />,
    );

    expect(container.querySelector('img[src="/first.jpg"]')).not.toBeNull();
    rerender(<HeroSlideshow images={[{ src: "/fresh.jpg", sortOrder: 1 }]} fallbackImage="/settings.jpg" />);

    expect(container.querySelector('img[src="/first.jpg"]')).toBeNull();
    expect(container.querySelector('img[src="/fresh.jpg"]')).not.toBeNull();
    expect(JSON.parse(localStorage.getItem("zusda-hero-slides-v1") ?? "null")).toEqual([
      { src: "/fresh.jpg", sortOrder: 1 },
    ]);
  });

  it("shows only the Site settings image when the CMS responds with no hero images", () => {
    localStorage.setItem("zusda-hero-slides-v1", JSON.stringify([images[0]]));

    const { container, rerender } = render(
      <HeroSlideshow images={[]} cmsReady={false} fallbackImage="/settings.jpg" />,
    );
    rerender(<HeroSlideshow images={[]} cmsReady fallbackImage="/settings.jpg" />);

    expect(container.querySelector('img[src="/first.jpg"]')).toBeNull();
    expect(container.querySelector('img[src="/settings.jpg"]')).not.toBeNull();
    expect(JSON.parse(localStorage.getItem("zusda-hero-slides-v1") ?? "null")).toEqual([]);
  });

  it("uses seed slides only when the CMS is unreachable and no cache exists", () => {
    const { container } = render(
      <HeroSlideshow images={[{ src: "/seed.jpg", sortOrder: 1 }]} cmsReady={false} cmsUnavailable />,
    );

    expect(container.querySelector('img[src="/seed.jpg"]')).not.toBeNull();
    expect(localStorage.getItem("zusda-hero-slides-v1")).toBeNull();
  });

  it("does not use seed slides offline when an empty CMS cache exists", () => {
    localStorage.setItem("zusda-hero-slides-v1", JSON.stringify([]));
    const { container } = render(
      <HeroSlideshow
        images={[{ src: "/seed.jpg", sortOrder: 1 }]}
        cmsReady={false}
        cmsUnavailable
        fallbackImage="/settings.jpg"
      />,
    );

    expect(container.querySelector('img[src="/seed.jpg"]')).toBeNull();
    expect(container.querySelector('img[src="/settings.jpg"]')).not.toBeNull();
  });

  it("shows only a navy placeholder before the CMS timeout when no slide cache exists", () => {
    vi.useFakeTimers();
    const { container } = render(
      <HeroSlideshow images={[]} cmsReady={false} fallbackImage="/settings.jpg" />,
    );

    expect(container.querySelector("img")).toBeNull();

    act(() => {
      vi.advanceTimersByTime(2999);
    });
    expect(container.querySelector("img")).toBeNull();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(container.querySelector('img[src="/settings.jpg"]')).not.toBeNull();
  });
});
