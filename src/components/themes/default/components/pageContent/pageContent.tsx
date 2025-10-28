// @components/SinglePageDetails.tsx
'use client';

import { useRouter ,usePathname} from 'next/navigation';
import { Icon } from '@iconify/react';
import Button from '@components/core/button';
import { useAppSelector } from '@lib/redux/store';

type OfferDetailPageProps = {
  data: Record<string, any>;
  dict: any;
};

const PageContent = ({ data, dict }: OfferDetailPageProps) => {
  const router = useRouter();
  const {map_address}=useAppSelector((state)=> state.appData.data.app)
    const pathname = usePathname();

  return (
    <div className="px-6 md:px-4 py-8">
      {/* Main Content Card */}
      <div className="w-full max-w-none overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
        {/* Page Content */}
        <div className='flex'>
      <div
          className="singpageDetails prose prose-gray dark:prose-invert prose-p:leading-relaxed w-full max-w-none py-10 px-12 border-b border-gray-200 dark:border-gray-700
            prose-headings:text-gray-900 dark:prose-headings:text-gray-100
            prose-strong:text-gray-900 dark:prose-strong:text-gray-100
            prose-a:text-blue-600 dark:prose-a:text-blue-400
            prose-blockquote:border-gray-300 dark:prose-blockquote:border-gray-600
            prose-code:text-red-600 dark:prose-code:text-red-400
            prose-pre:bg-gray-100 dark:prose-pre:bg-gray-900"
          dangerouslySetInnerHTML={{ __html: data.content || '' }}
        />
{(
  pathname === '/pages/contact' ||
  pathname === '/pages/contact-us'
  // pathname?.toLowerCase()?.includes('contact')
) && map_address && (
  <div className="bg-white w-full  dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
    <iframe
      key={map_address}
      src={map_address}
      width="100%"
      height="500"
      style={{ border: 'none' }}
      loading="lazy"
      allowFullScreen
      referrerPolicy="no-referrer-when-downgrade"
      title="Location Map"
    ></iframe>
  </div>
)}

        </div>

        {/* Footer */}
        <div className="w-full py-4 px-9 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between">
          <Button
            type="button"
            onClick={() => router.back()}
            className="inline-flex gap-1 w-auto bg-transparent transition-colors duration-400 ease-in-out text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30 items-center justify-center px-3.5 py-3 rounded-md text-sm font-medium border-none outline-none focus:outline-none"
          >
            <Icon
              icon="ic:outline-arrow-right-alt"
              width="24"
              height="24"
              className="transform rotate-180"
            />
            <span>{dict?.single_page?.go_back || 'Go Back'}</span>
          </Button>
        </div>
      </div>

      {/* Support Banner */}
      <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 px-6 py-7 rounded-lg mt-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left side: Text */}
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold text-blue-800 dark:text-blue-300">
              {dict?.single_page?.need_help || 'Need more information? Contact our support team.'}
            </h2>
            <p className="text-base text-blue-700 dark:text-blue-400 mt-1">
              {dict?.single_page?.emergency_support || 'Emergency assistance available'}
            </p>
          </div>

          {/* Right side: Button */}
          <Button
            type="button"
            size="lg"
            onClick={() => router.push('/contact')} // Better than back()
            className="flex gap-1 w-auto transition-colors duration-400 ease-in-out text-white hover:text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 items-center justify-center rounded-lg text-sm font-medium border-none outline-none focus:outline-none min-w-fit"
          >
            <Icon icon="material-symbols:contact-support-outline-rounded" width="18" height="18" />
            <span>{dict?.single_page?.contact_us || 'Contact Us'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PageContent;