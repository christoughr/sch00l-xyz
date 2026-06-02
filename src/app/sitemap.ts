import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL;
  const routes = [
    "",
    "/study",
    "/flashcards",
    "/progress",
    "/join",
    "/login",
    "/onboarding",
    "/settings",
    "/privacy",
    "/terms",
    "/teacher",
  ];
  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.8,
  }));
}
