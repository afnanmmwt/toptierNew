import * as React from 'react';
import type { Metadata } from 'next';
import { getDictionary } from '@src/get-dictionary';
import { activate_account } from '@src/actions';
import Link from 'next/link';

interface Props {
    params: Promise<{ slug: string[]; lang: 'en' | 'ar' }>;
}

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
    const { slug } = await params;
    // console.log('slug',slug)
    return {
        title: `Verify Email - ${slug[0] || 'User'}`,
        description: 'Verify your email to activate your account',

    };
};
const fetchData = async ({ slug }: { slug: string[] }): Promise<any> => {
    if (!slug) {
        return null;
    }

    if (slug[0] === undefined) {
        return null;

    }
    if (slug.length > 2) {
        return null;
    }
    if (slug[1] && slug[0]) {
        const payload = {
            user_id: slug[0],
            email_code: slug[1]
        }
        return activate_account(payload);

    }
    return null

}

const Page = async ({ params }: Props): Promise<React.JSX.Element> => {

    const { slug, lang } = await params;
    const data = await fetchData({ slug });

    const dictionary = await getDictionary(lang);
    if (!data.status) {

        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-2xl font-bold mb-4">Activate Failed</h1>
                <p className="mb-4">{data?.error}</p>
                <Link href={`/${lang}/auth/login`}>
                    {'Back to Login'}
                </Link>
            </div>
        );
    }
    return (
        <div className="flex flex-col items-center justify-center h-[500px]">
            <h1 className="text-2xl font-bold">{'Account Activated'}</h1>
            <p className="mb-3 text-xl">{data?.message}</p>
<Link href={`/${lang}/auth/login`} legacyBehavior>
  <p className="bg-blue-900 text-white   rounded-lg hover:bg-blue-800 cursor-pointer px-8 py-3">
    Login Now
  </p>
</Link>

        </div>)

};
export const dynamic = 'force-dynamic'; // Optional: if data changes often
export default Page;