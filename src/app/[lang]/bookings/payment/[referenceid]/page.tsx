import React from 'react';
import { getDictionary } from '@src/get-dictionary';
import TransitionLayout from '@src/utils/pageTransition';
import PendingPaymentDetails from '@components/themes/default/components/modules/hotels/components/bookingDetails/pendingPaymentDetails';
import { hotel_invoice } from '@src/actions';

export default async function Page({ params }: {
  params: Promise<{ lang: 'en' | 'ar', referenceid: string }>
}) {
  const { lang, referenceid } = await params;

  const dict = await getDictionary(lang);
  const invoice_response = await hotel_invoice(referenceid);
  const status = invoice_response?.status;
  const result = invoice_response?.response?.[0];


  return (
    <TransitionLayout>
      <div className="flex flex-col bg-white dark:bg-gray-900 dark:text-gray-50 min-h-screen items-center justify-center p-6">
        {!status ? (
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-red-500 mb-2">
              Invalid or expired booking reference
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please check your reference ID and try again.
            </p>
          </div>
        ) : (
          // ✅ Pass JSON data so no hydration mismatch
          <PendingPaymentDetails invoiceData={result} />
        )}
      </div>
    </TransitionLayout>
  );
}

export const dynamic = 'force-dynamic';
