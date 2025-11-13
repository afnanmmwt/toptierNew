'use client';
import { useEffect } from 'react';
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
    return (
        <div className="flex flex-col justify-center items-center min-h-screen text-center px-4">
            <h1 className="text-3xl font-bold text-red-600 mb-4">
                Something went wrong!
            </h1>
            <p className="text-base text-gray-600 mb-6">
                {error.message || 'An unexpected error occurred. Please try reloading the page.'}
            </p>
            <button
                className="bg-blue-900 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-full transition-colors"
                onClick={reset}
            >
                Reload Page
            </button>
        </div>
    );
}

