import * as React from 'react';
import type { Metadata } from 'next';
import { getDictionary } from '@src/get-dictionary';
import { activate_account } from '@src/actions';
import Link from 'next/link';
import { Icon } from '@iconify/react';

interface Props {
  params: Promise<{ slug: string[]; lang: 'en' | 'ar' }>;
}

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { slug } = await params;
  return {
    title: `Verify Email - ${slug?.[0] || 'User'}`,
    description: 'Verify your email to activate your account',
  };
};

const fetchData = async ({ slug }: { slug: string[] }): Promise<any> => {
  if (!slug || slug.length !== 2 || !slug[0] || !slug[1]) {
    return { status: false, error: 'Invalid activation link.' };
  }
  const payload = {
    user_id: slug[0],
    email_code: slug[1],
  };
  return activate_account(payload);
};

const Page = async ({ params }: Props): Promise<React.JSX.Element> => {
  const { slug, lang } = await params;
  const dict:any = await getDictionary(lang);
  const data = await fetchData({ slug });

  const isRTL = lang === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';

  if (!data?.status) {
    return (
      <div
        dir={dir}
        className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4"
      >
        <div className="text-center max-w-md w-full">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon icon="mdi:alert-circle-outline" className="text-red-600" width={48} height={48} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            { 'Activation Failed'}
          </h1>
          <p className="text-gray-600 mb-6 text-base">
            {data?.error || 'The activation link is invalid or has expired.'}
          </p>
          <Link
            href={`/${lang}/auth/login`}
            className="inline-block bg-blue-900 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-800 transition-colors"
          >
            {'Back to Login'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      dir={dir}
      className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4"
    >
      <div className="text-center max-w-md w-full">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
  <svg
    viewBox="0 0 24 24"
    className="w-12 h-12 text-green-600"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
      strokeDasharray="65"
      strokeDashoffset="65"
      className="animate-check-circle"
    />
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m9 11 3 3L22 4"
      strokeDasharray="30"
      strokeDashoffset="30"
      className="animate-check-mark"
    />
  </svg>
</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          {dict?.activated_account?.title ||  'Account Activated!'}
        </h1>
        <p className="text-gray-600 mb-6 text-meduim">
          {dict?.activated_account?.message ||  'Your email has been verified. You can now log in to your account.'}
        </p>
        <Link
          href={`/${lang}/auth/login`}
          className="inline-block bg-blue-900 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-800 transition-colors shadow-md hover:shadow-lg"
        >
          {dict?.activated_account?.login_text || 'Login Now'}
        </Link>
      </div>
    </div>
  );
};

export const dynamic = 'force-static';
export default Page;