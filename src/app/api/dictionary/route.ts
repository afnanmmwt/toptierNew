// app/api/dictionary/route.ts
import { getDictionary } from "@src/get-dictionary";
import { NextResponse } from "next/server";

const supportedLangs = ["en", "ar", "ch", "fr", "ge", "ru", "tr"] as const;
type SupportedLang = (typeof supportedLangs)[number];
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang");

  if (!lang || !supportedLangs.includes(lang as SupportedLang)) {
    return NextResponse.json(
      { error: "Invalid lang parameter" },
      { status: 400 }
    );
  }

  try {
    const dict = await getDictionary(lang as SupportedLang);
    return NextResponse.json(dict);
  } catch (err) {
    return NextResponse.json(
      { error: err },
      { status: 500 } 
    );
  }
}
