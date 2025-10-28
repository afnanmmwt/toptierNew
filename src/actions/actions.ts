export const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
export const token = process.env.NEXT_PUBLIC_API_ACCESS_TOKEN;
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
export const api_key = process.env.NEXT_PUBLIC_API_KEY;
export const fetchDict = async (lang: string) => {
  try {
    const response = await fetch(`/api/dictionary?lang=${lang}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || data?.status === false) {
      return { error: data?.message || "Something went wrong" };
    }
    return data;
  } catch (error) {
    return { error: (error as Error).message || "An error occurred" };
  }
};



