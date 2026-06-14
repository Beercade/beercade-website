import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import puppeteer, { type Browser } from "puppeteer-core";
import chromium from "@sparticuz/chromium";

// A PDF needs no WebGL/GPU; skipping the graphics stack trims launch time and
// memory on the serverless function.
chromium.setGraphicsMode = false;

// Renders /print/menu in headless Chromium and returns it as a two-page A3
// PDF. Chromium is heavy, so the route is rate-limited per IP and capped at
// 60s. Content always reflects the studio as it stands (the print route is
// force-dynamic).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Generating a PDF launches a browser; don't let an unauthenticated client do
// that in a tight loop. Fails open when Redis env is absent (local dev).
async function rateLimitPdf(identifier: string): Promise<boolean> {
  if (!process.env.UPSTASH_REDIS_REST_URL) return true;
  try {
    const limiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, "1 h"),
      prefix: "rl:menu-pdf",
    });
    const { success } = await limiter.limit(identifier);
    return success;
  } catch {
    return true;
  }
}

// Local dev has no @sparticuz/chromium binary; use an installed Chrome.
const LOCAL_CHROME_PATHS = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
];

async function launchBrowser(): Promise<Browser> {
  if (process.env.VERCEL) {
    return puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }
  const { existsSync } = await import("node:fs");
  const executablePath =
    process.env.PUPPETEER_EXECUTABLE_PATH ??
    LOCAL_CHROME_PATHS.find((p) => existsSync(p));
  if (!executablePath) {
    throw new Error(
      "No local Chrome found for PDF rendering. Set PUPPETEER_EXECUTABLE_PATH."
    );
  }
  return puppeteer.launch({ executablePath, headless: true });
}

export async function GET(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!(await rateLimitPdf(ip))) {
    return NextResponse.json(
      { error: "Too many downloads in a row. Give it a few minutes." },
      { status: 429 }
    );
  }

  // Resolve our own origin so the headless browser hits this deployment
  // (production, preview, or localhost), not a hardcoded host.
  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!host) {
    return NextResponse.json({ error: "Missing host header." }, { status: 400 });
  }

  let browser: Browser | undefined;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();

    // Preview deployments sit behind Vercel deployment protection; the
    // bypass secret lets our own headless browser through.
    const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
    if (bypass) {
      await page.setExtraHTTPHeaders({ "x-vercel-protection-bypass": bypass });
    }

    await page.goto(`${proto}://${host}/print/menu`, {
      waitUntil: "networkidle0",
      timeout: 30_000,
    });
    await page.evaluateHandle("document.fonts.ready");

    const pdf = await page.pdf({
      format: "a3",
      printBackground: true,
      preferCSSPageSize: true,
    });

    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="beercade-menu-a3.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("menu-pdf generation failed", error);
    // TEMP(verify): surface the real error on preview so we can confirm the
    // Chromium fix landed. Remove before marking the PR ready.
    if (req.nextUrl.searchParams.get("debug") === "1") {
      return NextResponse.json(
        {
          error: "The PDF didn't generate. Try again in a minute.",
          debug: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "The PDF didn't generate. Try again in a minute." },
      { status: 500 }
    );
  } finally {
    await browser?.close().catch(() => {});
  }
}
