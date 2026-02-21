// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: process.env.SITE_URL || "http://localhost:4321",
  output: "static",
  integrations: [
    expressiveCode({
      themes: ["dracula", "github-light"],
      themeCssSelector: (theme) => {
        if (theme.name === "dracula") return '[data-theme="dark"]';
        return '[data-theme="light"]';
      },
      styleOverrides: {
        borderRadius: "0.5rem",
      },
    }),
    sitemap(),
    icon(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    remotePatterns: [
      { protocol: "https", hostname: "**.yourdomain.com" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
});
