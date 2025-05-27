"use client";

import { ServerCrash } from "lucide-react";
import { use, useEffect } from "react";

import { Button } from "@/components/ui/button";

// Remove i18n navigation Link and import standard Link
import Link from "next/link";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";

export default function Error({
  params,
  error,
  reset,
}: {
  params?: Promise<{ locale: string }>;
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  // Handle case where params might be undefined
  let locale = 'en'; // Default fallback locale
  try {
    if (params) {
      const paramsData = use(params);
      locale = paramsData?.locale || 'en';
    }
  } catch (e) {
    console.error('Error retrieving locale from params:', e);
  }

  // Comment out setRequestLocale since it requires the i18n context
  // try {
  //   setRequestLocale(locale);
  // } catch (e) {
  //   console.warn('Could not set request locale:', e);
  // }

  // Don't try to use translations in the error boundary - just use hardcoded text
  const errorTitle = 'Something went wrong';
  const errorMessage = 'Sorry, an unexpected error has occurred.';
  const tryAgainText = 'Try again';
  const returnHomeText = 'Return home';

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-red-100">
        <ServerCrash className="w-10 h-10 text-red-600" />
      </div>
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        {errorTitle}
      </h1>
      <p className="mb-8 text-lg text-gray-600">{errorMessage}</p>
      <div className="flex flex-col gap-4 sm:flex-row">
        <Button onClick={() => reset()} variant="default">
          {tryAgainText}
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">
            {returnHomeText}
          </Link>
        </Button>
      </div>
    </div>
  );
}
