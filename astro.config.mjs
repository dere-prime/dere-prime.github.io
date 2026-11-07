import { defineConfig } from "astro/config";

const site = process.env.SITE_URL || "https://dere-prime.github.io";
const base = `/${(process.env.BASE_PATH || "").replace(/^\/+|\/+$/g, "")}`;

export default defineConfig({
  site,
  base,
  output: "static",
  trailingSlash: "always",
  build: { format: "directory" },
  devToolbar: { enabled: false },
});
