import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier";

// ESLint 9 flat config. eslint-config-next 16 ships native flat configs, so we
// spread them directly. Replaces the old .eslintrc.json
// (`extends: ["next/core-web-vitals", "prettier"]`).
const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "public/**",
      "next-env.d.ts",
    ],
  },
  ...nextCoreWebVitals,
  prettier,
  {
    rules: {
      // New in eslint-plugin-react-hooks v6 (bundled with eslint-config-next
      // 16); not part of this project's pre-modernization lint baseline. The
      // flagged sites (Header route-change close, HeroLoop matchMedia +
      // reduced-motion sync) are intentional, shipped patterns. Kept off to
      // keep the framework bump behaviour-preserving; revisit as a follow-up.
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default eslintConfig;
