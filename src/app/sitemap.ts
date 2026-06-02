import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://sch00l.xyz";
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
