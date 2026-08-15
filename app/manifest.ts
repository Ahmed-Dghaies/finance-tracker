import { withBasePath } from "@/lib/site-path";

import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Finance Tracker",
    short_name: "Finance Tracker",
    description: "Track expenses, income, investments, and net worth.",
    start_url: withBasePath("/"),
    scope: withBasePath("/"),
    display: "standalone",
    background_color: "#101827",
    theme_color: "#101827",
    icons: [
      {
        src: withBasePath("/icon.svg"),
        sizes: "1024x1024",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
