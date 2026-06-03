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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const normalisedSlides: HeroSlide[] = slides?.length
    ? slides
    : videoUrl
    ? [{ _key: "legacy-video", mediaType: "video", videoUrl }]
    : poster
    ? [{ _key: "legacy-poster", mediaType: "image", image: poster }]
    : [];

  const hasMultiple = normalisedSlides.length > 1;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Auto-advance
  useEffect(() => {
    if (reducedMotion || !hasMultiple) return;

    timerRef.current = setTimeout(() => {
      const next = (activeIdx + 1) % normalisedSlides.length;
      setFadingIdx(activeIdx);
      setActiveIdx(next);
      setTimeout(() => setFadingIdx(null), FADE_DURATION);
    }, SLIDE_DURATION);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeIdx, reducedMotion, hasMultiple, normalisedSlides.length]);

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
      className="relative flex min-h-[88svh] items-end overflow-hidden bg-tilt-purple"
      aria-label="Hero"
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
              <video
                src={slide.videoFileUrl ?? slide.videoUrl ?? undefined}
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover opacity-[0.62]"
              />
            ) : slide.mediaType === "image" && slide.image ? (
              <div className={`h-full w-full ${!reducedMotion ? kbClass : ""}`}>
                <Image
                  src={urlFor(slide.image).width(1920).height(1080).auto("format").url()}
                  alt={(slide.image as { alt?: string }).alt ?? "Beercade venue"}
                  fill
                  priority={i === 0}
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
        className="relative z-[3] w-full pb-16 pt-28"
        style={{
          opacity: contentOpacity,
          willChange: "opacity",
        }}
      >
        <div className="mx-auto w-full max-w-layout px-(--grid-gutter-mobile) md:px-(--grid-gutter)">
          {/* Master logo — neon-tube wordmark + mascot (brand §5). Seated on a
              flat Tilt Purple chip (brand §235) so the line-art reads cleanly
              over any hero photo, with generous clear space on all sides; sits
              above the headline at hero scale, min 96px wide. */}
          <div className="mb-10 inline-block bg-tilt-purple px-7 py-6 sm:px-10 sm:py-8">
            <Image
              src="/images/beercade-wordmark.png"
              alt="Beercade"
              width={788}
              height={514}
              priority
              className="h-auto w-52 sm:w-64 md:w-[22rem]"
            />
          </div>
          <h1 className="t-display max-w-3xl text-balance text-crema">
            {headline ?? (
              /* PLACEHOLDER */
              "The pub night that actually has something to do."
            )}
          </h1>
          {subline && (
            <p className="t-lede mt-5 max-w-xl text-crema/80">{subline}</p>
          )}
          <div className="mt-10">
            <CTAButton
              href={ctaTarget ?? "/functions"}
              variant="primary"
              className="px-8 py-4 text-base"
            >
              {ctaLabel ?? "BOOK A FUNCTION"}
            </CTAButton>
          </div>
        </div>

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
