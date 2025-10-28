import * as React from 'react';
import type { Metadata } from 'next';
import { getDictionary } from '@src/get-dictionary';
import { cms_pages_content } from '@src/actions/server-actions';
import { Breadcrumb } from '@components/core/breadCrumb';
import { PageContent } from '@components/themes/default';
import TransitionLayout from '@src/utils/pageTransition';

interface Props {
  params: Promise<{ slug: string; lang: 'en' | 'ar' }>;
}

//  Metadata: Uses dynamic data → mark as dynamic
export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { slug , lang} = await params;
  const payload ={
    slug_url: slug,
    lang: lang
  }
  const response = await cms_pages_content(payload);
  const page_data = response?.data;
  console.log("page data", page_data)
  return {
    title: page_data?.page_name ? `${page_data.page_name} - Page Details` : 'Page Details',
    description: page_data?.short_description
      ? page_data.short_description.substring(0, 160)
      : 'View page details.',
    openGraph: {
      title: page_data?.page_name || 'Booknow',
      description: 'Launch your travel business in minutes with Booknow.',
      siteName: 'Booknow',
    },
  };
};

//==============>> Page Component with ISR
const Page = async ({ params }: Props): Promise<React.JSX.Element> => {
  const { slug, lang } = await params;
  const payload ={
    slug_url: slug,
    lang: lang
  }
  // Fetch data
  const response = await cms_pages_content(payload);
  const page_data = response?.data[0];
  const dict = await getDictionary(lang);
  if (!page_data) {
    return (
      <TransitionLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center px-4 bg-slate-50 dark:bg-gray-900 min-h-screen">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Page Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
      </TransitionLayout>
    );
  }

  return (
    <TransitionLayout>
      <div className="w-full bg-slate-50 dark:bg-gray-900 min-h-screen h-full transition-colors duration-200">         
        {/* Page Header */}
        <div className="py-7 bg-white dark:bg-gray-800 border-t border-b border-gray-200 dark:border-gray-700 px-6 ">
          <div className="max-w-[1200px] mx-auto px-0 sm:px-3 md:px-7">
            <Breadcrumb />
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mt-4">
              {page_data.page_name}
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-[1200px] mx-auto py-8 sm:px-4 ">
          <PageContent data={page_data} dict={dict} />
        </div>
      </div>
    </TransitionLayout>
  );
};

// ✅ Enable ISR: Revalidate every 1 hour (3600 seconds)
// Or use shorter for frequent updates (e.g. 60)
export const dynamic = 'force-dynamic'; // Optional: if data changes often

export default Page;