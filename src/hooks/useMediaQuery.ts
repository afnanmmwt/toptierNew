import { useEffect, useState } from "react";

const breakpoints: Record<string, number> = {
  xs: 576,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

export function useMediaQuery(bp: keyof typeof breakpoints): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia(`(max-width: ${breakpoints[bp] - 1}px)`); // `-1` to match Tailwind behavior
    const handleChange = () => setMatches(media.matches);

    handleChange(); // initial
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [bp]);

  return matches;
}
