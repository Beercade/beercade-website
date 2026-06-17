import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    // Unit tests only. Playwright specs live in /e2e and use `.spec.ts`.
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: ["node_modules", ".next", "e2e", "studio"],
  },
  resolve: {
    alias: {
      // `server-only` throws when imported outside an RSC bundle; swap it for a
      // no-op so we can unit-test the server libs.
      "server-only": fileURLToPath(
        new URL("./test/stubs/empty.ts", import.meta.url),
      ),
      "@": root.replace(/\/$/, ""),
    },
  },
});
