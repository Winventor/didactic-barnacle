import type { NextConfig } from "next";

const repoName = "didactic-barnacle";
const isGithubPages = process.env.GITHUB_PAGES === "true";
const isStaticExport =
  process.env.STATIC_EXPORT === "true" || isGithubPages;

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  ...(isStaticExport
    ? {
        output: "export",
        trailingSlash: true,
      }
    : {}),
  ...(isGithubPages
    ? {
        basePath: `/${repoName}`,
        assetPrefix: `/${repoName}/`,
      }
    : {}),
};

export default nextConfig;
