import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const repoName = process.env.GITHUB_REPOSITORY?.split("/").pop();
const isGitHubPagesBuild = process.env.GITHUB_ACTIONS === "true" && repoName;
const repoRoot = fileURLToPath(new URL(".", import.meta.url));

const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: isGitHubPagesBuild ? `/${repoName}` : undefined,
  turbopack: {
    root: repoRoot,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
