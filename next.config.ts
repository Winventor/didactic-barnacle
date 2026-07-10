import type { NextConfig } from "next";

const repoName = "didactic-barnacle";
const isGithubPagesProject = process.env.GITHUB_PAGES === "true";
const isStaticExport =
  process.env.STATIC_EXPORT === "true" || isGithubPagesProject;

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "waldacoaching.nl",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
  ...(isStaticExport
    ? {
        output: "export",
        trailingSlash: true,
      }
    : {}),
  // Alleen basePath voor github.io/<repo> — niet bij eigen domein of Render/Vercel
  ...(isGithubPagesProject
    ? {
        basePath: `/${repoName}`,
        assetPrefix: `/${repoName}/`,
      }
    : {}),
};

export default nextConfig;
