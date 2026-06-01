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
  const [isMobile, setIsMobile] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Build a normalised slide list — fall back to legacy single-media props
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

  // Scroll-driven parallax (vanilla, rAF-throttled). Skipped under reduced motion.
  useEffect(() => {
    if (reducedMotion) {
      setOffsetY(0);
      return;
    }

    let frame = 0;
    const updateViewport = () => setIsMobile(window.innerWidth < 768);
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        setOffsetY(window.scrollY);
        frame = 0;
      });
    };

    updateViewport();
    onScroll();
    window.addEventListener("resize", updateViewport);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateViewport);
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

  // Cap the scroll input so the hero settles rather than drifting forever.
  const capped = Math.min(offsetY, 1600);
  const mediaTranslate = capped * (isMobile ? 0.14 : 0.26);
  const gradientTranslate = capped * (isMobile ? 0.22 : 0.42);
  const glowTranslate = capped * (isMobile ? 0.1 : 0.18);
  const contentTranslate = capped * (isMobile ? 0.12 : 0.2);
  const contentOpacity = 1 - Math.min(capped / 520, 1);
  const scrollScale =
    1 + Math.min(capped * (isMobile ? 0.00006 : 0.00012), isMobile ? 0.025 : 0.06);

  // Hero wordmark — a neon sign that powers down as you descend into the venue.
  const logoLift = capped * (isMobile ? 0.4 : 0.6); // foreground parallax, faster than content
  const logoScale = 1 - Math.min(capped / 2600, 0.18); // eases 1 → ~0.82
  const logoTilt = Math.min(capped / 26, 16); // rotateX 0 → 16deg — look up as you pass under
  const logoFade = 1 - Math.min(capped / 440, 1); // gone by ~440px so it never fights the headline
  const logoGlow = Math.max(0, 1 - capped / 480); // neon dims as the sign switches off

  return (
    <section
      className="relative flex min-h-[90svh] items-end overflow-hidden bg-tilt-purple"
      aria-label="Hero"
    >
      {/* Slide stack */}
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
              transform: `translateY(${mediaTranslate}px) scale(${scrollScale})`,
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
                className="h-full w-full object-cover opacity-40"
              />
            ) : slide.mediaType === "image" && slide.image ? (
              <div className={`h-full w-full ${!reducedMotion ? kbClass : ""}`}>
                <Image
                  src={urlFor(slide.image).width(1920).height(1080).auto("format").url()}
                  alt={(slide.image as { alt?: string }).alt ?? "Beercade venue"}
                  fill
                  priority={i === 0}
                  className="object-cover opacity-40"
                  sizes="100vw"
                />
              </div>
            ) : null}
          </div>
        );
      })}

      {/* Depth gradient — darkens toward the bottom so content stays legible */}
      <div
        className="absolute inset-0 z-[2]"
        style={{
          transform: `translateY(${gradientTranslate}px)`,
          background:
            "linear-gradient(to bottom, rgb(20 16 26 / 0.10), rgb(20 16 26 / 0.35) 42%, rgb(20 16 26 / 0.78) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Brand glow accents — Tilt Purple + High Score Orange, parallaxed */}
      <div
        className="absolute inset-0 z-[2]"
        style={{
          transform: `translateY(${glowTranslate}px) scale(1.06)`,
          background:
            "radial-gradient(circle at 72% 28%, rgb(122 60 226 / 0.30), transparent 32%), radial-gradient(circle at 24% 76%, rgb(255 94 31 / 0.20), transparent 30%)",
        }}
        aria-hidden="true"
      />

      {/* Grid + noise texture */}
      <div className="grid-overlay absolute inset-0 z-[2] opacity-30" aria-hidden="true" />
      <div className="hero-noise absolute inset-0 z-[2]" aria-hidden="true" />

      {/* Scanline overlay */}
      <div
        className="absolute inset-0 z-[2]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgb(0 0 0 / 0.05) 3px, rgb(0 0 0 / 0.05) 4px)",
        }}
        aria-hidden="true"
      />

      {/* Wordmark — neon sign, parallaxed; powers down on scroll.
          Sits top-centre on mobile, right-of-headline on desktop. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-[6%] z-[3] flex justify-center px-6 md:inset-x-auto md:left-auto md:right-[4%] md:top-1/2 md:-translate-y-1/2 md:justify-end md:px-0"
        style={{ perspective: "1000px", opacity: logoFade }}
        aria-hidden="true"
      >
        <div
          style={{
            transform: `translateY(${-logoLift}px) scale(${logoScale}) rotateX(${logoTilt}deg)`,
            transformOrigin: "center top",
            willChange: "transform",
          }}
        >
          <Image
            src="/images/beercade-wordmark.png"
            alt=""
            width={788}
            height={514}
            priority
            sizes="(max-width: 768px) 58vw, 360px"
            className={`h-auto w-[min(58vw,300px)] md:w-[min(34vw,360px)] ${reducedMotion ? "" : "hero-neon-flicker"}`}
            style={{
              filter: `drop-shadow(0 0 ${20 * logoGlow}px rgb(122 60 226 / ${
                0.55 * logoGlow
              })) drop-shadow(0 0 ${40 * logoGlow}px rgb(122 60 226 / ${
                0.3 * logoGlow
              })) drop-shadow(0 0 ${56 * logoGlow}px rgb(255 94 31 / ${
                0.22 * logoGlow
              }))`,
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div
        className="relative z-[3] w-full pb-16 pt-24"
        style={{
          transform: `translateY(${-contentTranslate}px)`,
          opacity: contentOpacity,
          willChange: "transform, opacity",
        }}
      >
        <div className="mx-auto w-full max-w-layout px-(--grid-gutter-mobile) md:px-(--grid-gutter)">
          <h1 className="max-w-3xl font-display text-5xl font-bold text-crema md:text-7xl lg:text-8xl">
            {headline ?? (
              /* PLACEHOLDER */
              "The pub night that actually has something to do."
            )}
          </h1>
          {subline && (
            <p className="mt-4 max-w-xl font-body text-lg text-crema/80">
              {subline}
            </p>
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

        {/* Slide indicators */}
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
                className={`h-1.5 rounded-full transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-crema ${
                  i === activeIdx
                    ? "w-8 bg-crema"
                    : "w-1.5 bg-crema/40 hover:bg-crema/70"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
