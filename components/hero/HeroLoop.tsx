"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";
import { CTAButton } from "@/components/ui/CTAButton";
import type { SanityImageSource } from "@sanity/image-url";

const KB_CLASSES = ["kb-1", "kb-2", "kb-3", "kb-4"] as const;

export interface HeroSlide {
  _key: string;
  mediaType: "image" | "video";
  videoUrl?: string | null;
  videoFileUrl?: string | null;
  image?: (SanityImageSource & { alt?: string }) | null;
}

interface HeroLoopProps {
  slides?: HeroSlide[] | null;
  headline?: string | null;
  subline?: string | null;
  ctaLabel?: string | null;
  ctaTarget?: string | null;
  // Legacy single-media props kept for backward compat
  videoUrl?: string | null;
  poster?: (SanityImageSource & { alt?: string }) | null;
}

const SLIDE_DURATION = 6000;
const FADE_DURATION = 600;

export function HeroLoop({
  slides,
  headline,
  subline,
  ctaLabel = "BOOK A FUNCTION",
  ctaTarget = "/functions",
  videoUrl,
  poster,
}: HeroLoopProps) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [fadingIdx, setFadingIdx] = useState<number | null>(null);
  const [offsetY, setOffsetY] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const normalisedSlides: HeroSlide[] = slides?.length
    ? slides
    : videoUrl
    ? [{ _key: "legacy-video", mediaType: "video", videoUrl }]
    : poster
    ? [{ _key: "legacy-poster", mediaType: "image", image: poster }]
    : [];

  const hasMultiple = normalisedSlides.length > 1;
  // Eager-load the first image slide even when a video leads the deck — it
  // paints first (video poster gap) and is the likely LCP element.
  const firstImageIdx = normalisedSlides.findIndex(
    (s) => s.mediaType === "image"
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Auto-advance
  useEffect(() => {
    if (reducedMotion || !hasMultiple || paused) return;

    timerRef.current = setTimeout(() => {
      const next = (activeIdx + 1) % normalisedSlides.length;
      setFadingIdx(activeIdx);
      setActiveIdx(next);
      setTimeout(() => setFadingIdx(null), FADE_DURATION);
    }, SLIDE_DURATION);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeIdx, reducedMotion, hasMultiple, paused, normalisedSlides.length]);

  // The pause control also stops any playing slide video (WCAG 2.2.2 — the
  // whole surface stops moving, not just the carousel).
  useEffect(() => {
    sectionRef.current?.querySelectorAll("video").forEach((video) => {
      if (paused) {
        video.pause();
      } else {
        video.play().catch(() => {});
      }
    });
  }, [paused, activeIdx]);

  // One gentle scroll layer: the media drifts and the content fades as you
  // descend. No differential multi-layer parallax — restraint reads as confidence.
  useEffect(() => {
    if (reducedMotion) {
      setOffsetY(0);
      return;
    }
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        setOffsetY(window.scrollY);
        frame = 0;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [reducedMotion]);

  const goTo = (idx: number) => {
    if (idx === activeIdx) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setFadingIdx(activeIdx);
    setActiveIdx(idx);
    setTimeout(() => setFadingIdx(null), FADE_DURATION);
  };

  const capped = Math.min(offsetY, 800);
  const mediaTranslate = capped * 0.15;
  const contentOpacity = 1 - Math.min(capped / 480, 1);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[88svh] items-end overflow-hidden bg-tilt-purple"
      aria-label="Hero"
      data-paused={paused || undefined}
    >
      {/* Slide stack — photography carries the hero (brand §7). */}
      {normalisedSlides.map((slide, i) => {
        const isActive = i === activeIdx;
        const isFading = i === fadingIdx;
        if (!isActive && !isFading) return null;

        const kbClass = KB_CLASSES[i % KB_CLASSES.length];

        return (
          <div
            key={slide._key}
            className="absolute inset-0 transition-opacity"
            style={{
              opacity: isActive ? 1 : 0,
              transitionDuration: `${FADE_DURATION}ms`,
              zIndex: isActive ? 1 : 0,
              transform: `translateY(${mediaTranslate}px)`,
              willChange: "transform, opacity",
            }}
            aria-hidden={!isActive}
          >
            {slide.mediaType === "video" &&
            (slide.videoFileUrl || slide.videoUrl) &&
            !reducedMotion ? (
              <>
                <video
                  src={slide.videoFileUrl ?? slide.videoUrl ?? undefined}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-full w-full object-cover opacity-[0.62]"
                />
                {/* Scanline overlay — brand §8 device for video backgrounds. */}
                <div
                  className="scanlines pointer-events-none absolute inset-0"
                  aria-hidden="true"
                />
              </>
            ) : slide.mediaType === "image" && slide.image ? (
              <div className={`relative h-full w-full ${!reducedMotion ? kbClass : ""}`}>
                <Image
                  src={urlFor(slide.image).width(1920).height(1080).auto("format").url()}
                  alt={(slide.image as { alt?: string }).alt ?? "Beercade venue"}
                  fill
                  priority={i === firstImageIdx}
                  className="object-cover opacity-[0.62]"
                  sizes="100vw"
                />
              </div>
            ) : null}
          </div>
        );
      })}

      {/* Single legibility gradient — darkens toward the bottom where the type sits. */}
      <div
        className="absolute inset-0 z-[2]"
        style={{
          background:
            "linear-gradient(to bottom, rgb(20 16 26 / 0.15) 0%, rgb(20 16 26 / 0.30) 45%, rgb(20 16 26 / 0.82) 100%)",
        }}
        aria-hidden="true"
      />

      {/* One faint texture for depth. */}
      <div className="hero-noise absolute inset-0 z-[2]" aria-hidden="true" />

      {/* Content */}
      <div
        className="relative z-[3] w-full pb-24 pt-28 md:pb-32"
        style={{
          opacity: contentOpacity,
          willChange: "opacity",
        }}
      >
        <div className="mx-auto w-full max-w-layout px-(--grid-gutter-mobile) md:px-(--grid-gutter)">
          {/* Logo and headline sit side by side from md up; stacked on mobile. */}
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:gap-10 lg:gap-14">
            {/* Master logo — neon-tube wordmark + mascot (brand §5). Seated on a
                flat Tilt Purple chip (brand §235) so the line-art reads cleanly
                over any hero photo, with generous clear space on all sides. */}
            <div className="shrink-0 self-start bg-tilt-purple px-7 py-6 sm:px-10 sm:py-8 md:self-center">
              <Image
                src="/images/beercade-stacked-white.svg"
                alt="Beercade"
                width={1000}
                height={806}
                priority
                unoptimized
                className="h-auto w-44 sm:w-56 md:w-60 lg:w-72"
              />
            </div>

            <div className="min-w-0 md:flex-1">
              <h1 className="t-display-xl max-w-3xl text-balance text-crema">
                {headline ?? (
                  /* PLACEHOLDER */
                  "The pub night that actually has something to do."
                )}
              </h1>
              {subline && (
                <p className="t-lede mt-5 max-w-xl text-crema/80">{subline}</p>
              )}
              <div className="mt-8">
                <CTAButton
                  href={ctaTarget ?? "/functions"}
                  variant="primary"
                  className="px-8 py-4 text-base"
                >
                  {ctaLabel ?? "BOOK A FUNCTION"}
                </CTAButton>
              </div>
            </div>
          </div>
        </div>

        {/* Pause/play — auto-advancing content needs a stop control (WCAG 2.2.2).
            Hidden under reduced motion, where nothing auto-advances anyway. */}
        {!reducedMotion &&
          (hasMultiple ||
            normalisedSlides.some((s) => s.mediaType === "video")) && (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-pressed={paused}
              aria-label={paused ? "Play slideshow" : "Pause slideshow"}
              className="absolute bottom-4 right-4 z-[4] flex h-9 w-9 items-center justify-center border border-crema/40 bg-after-dark/60 text-crema transition-colors hover:border-crema focus-visible:outline focus-visible:outline-2 focus-visible:outline-crema md:bottom-6 md:right-6"
            >
              {paused ? (
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                  <path d="M2 1l9 5-9 5z" fill="currentColor" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                  <rect x="2" y="1" width="3" height="10" fill="currentColor" />
                  <rect x="7" y="1" width="3" height="10" fill="currentColor" />
                </svg>
              )}
            </button>
          )}

        {/* Slide indicators — thin squared bars (hard-edge system). */}
        {hasMultiple && (
          <div
            className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2"
            role="tablist"
            aria-label="Hero slides"
          >
            {normalisedSlides.map((slide, i) => (
              <button
                key={slide._key}
                role="tab"
                aria-selected={i === activeIdx}
                aria-label={`Slide ${i + 1}`}
                onClick={() => goTo(i)}
                className={`h-1 transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-crema ${
                  i === activeIdx ? "w-8 bg-crema" : "w-4 bg-crema/40 hover:bg-crema/70"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
