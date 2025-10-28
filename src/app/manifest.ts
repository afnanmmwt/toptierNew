import type { MetadataRoute } from "next";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const base_url = process.env.NEXT_PUBLIC_SITE_URL;

  return {
    name: "iata.com",
    short_name: "iata",
    description: "desc",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: `${base_url}/images/logo.png`,
        sizes: "150x50",
        type: "image/png",
      },
      {
        src: `${base_url}/images/logo.png`,
        sizes: "150x50",
        type: "image/png",
      },
    ],
  };
}
