import type { MetadataRoute } from "next";

// Utility to escape XML special characters
const escapeXml = (unsafe: string): string =>
  // Replace special characters with their XML entities
  unsafe?.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL!;

  // Static support routes
  const supportRoutes = ["/privacy-policy", "/contact-us", "/about-us"];

  return [
    // Home route
    {
      url: escapeXml(baseUrl),
      lastModified: new Date().toISOString(),
      alternates: {
        languages: {
          en: escapeXml(baseUrl),
          ar: escapeXml(`${baseUrl}/ar`),
        },
      },
    },
    ...supportRoutes.map((route) => ({
      url: escapeXml(`${baseUrl}/support${route}`),
      lastModified: new Date().toISOString(),
    })),
  ];
}
