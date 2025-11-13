import ForgetPassword from "@components/themes/default/components/auth/forgetPassword/forgetPassword";
import { getDictionary } from "@src/get-dictionary";
import React from "react";
import { Metadata } from "next/types";
export const metadata = { title: `Auth | Forget Password` } satisfies Metadata;
export default async function Page({
  params,
}: {
  params: Promise<{ lang: "en" | "ar" }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return (
    <>
      <ForgetPassword dict={dict} />
    </>
  );
}
export const dynamic = "force-dynamic";
