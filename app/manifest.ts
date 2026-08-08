import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Siro — Tax Readiness & Records",
    short_name: "Siro",
    description: "Keep your Nigerian business records organized and tax-ready.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#F9FAFB",
    theme_color: "#2F6EF6",
    orientation: "portrait",
    lang: "en-NG",
    icons: [
      { src: "/pwa-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/pwa-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/pwa-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/pwa-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
