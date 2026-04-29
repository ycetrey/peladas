import type { NextConfig } from "next";

/** Bind mounts (ex.: Docker Desktop no Windows) não propagam inotify; polling estabiliza o dev server. */
const useWebpackPolling =
  process.env.DOCKER === "1" ||
  process.env.WATCHPACK_POLLING === "true" ||
  process.env.CHOKIDAR_USEPOLLING === "true" ||
  process.env.NEXT_WEBPACK_USE_POLLING === "1";

const nextConfig: NextConfig = {
  webpack: (config, { dev }) => {
    if (dev && useWebpackPolling) {
      config.watchOptions = {
        ...config.watchOptions,
        poll: 500,
        aggregateTimeout: 200,
      };
    }
    return config;
  },
};

export default nextConfig;
