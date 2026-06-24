import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "pd409r0v",
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  },
  studioHost: "beercade",
  // Pin the deployed application so `sanity deploy` doesn't prompt for an app id.
  deployment: {
    appId: "fkvpremo1cwp1ryjeohjjimg",
  },
});
