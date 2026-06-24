// Root Studio config for the Sanity CLI (`sanity build` / `sanity deploy`).
// The real config lives in studio/ because the Studio is embedded in the Next
// app at /studio; this re-export gives the CLI — including Sanity 6's schema +
// manifest deployment step — a defineConfig export to resolve at the repo root.
export { default } from "./studio/sanity.config";
