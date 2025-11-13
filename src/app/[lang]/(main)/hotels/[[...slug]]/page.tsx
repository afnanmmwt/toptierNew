import React from "react";
import { getDictionary } from "@src/get-dictionary";
import TransitionLayout from "@src/utils/pageTransition";
import { Metadata } from "next";
import {
  HeroSection,
  FeaturedHotels,
  HotelsListingMain,
} from "@components/themes/default";

export const metadata = { title: `Toptier |  Hotels` } satisfies Metadata;
export default async function Page({
  params,
}: {
  params: Promise<{ lang: "en" | "ar"; slug: string[] }>;
}) {
  const { slug } = await params;
  return (
    <TransitionLayout>
      <div className="flex flex-col bg-white dark:bg-gray-900 dark:text-gray-50">
        {slug ? (
          <HotelsListingMain slug={slug} />
        ) : (
          <div className="flex  flex-col bg-white dark:bg-gray-900  dark:text-gray-50 ">
            <HeroSection />
            <FeaturedHotels />
          </div>
        )}
      </div>
    </TransitionLayout>
  );
}

export const dynamic = "force-dynamic";
