import type { ReactElement } from 'react';
// import { getTranslations, setRequestLocale } from 'next-intl/server'; // Removed
import { notFound } from 'next/navigation';
import { getStoreDetailsBySlug, UNVERPACKT_SAARBRUECKEN_DETAILS } from '@/data/storeDetailsData';
import StoreDetailsPage from '@/components/pages/StoreDetailsPage';
import { routing } from "@/i18n/routing";
const { locales } = routing; // locales might still be needed for generateStaticParams if the [locale] segment is kept

/**
 * @file src/app/[locale]/explore/[citySlug]/[storeSlug]/page.tsx
 * @description Route handler for individual store detail pages (English strings hardcoded).
 */

interface StoreDetailsRouteProps {
  params: {
    locale: string; // Kept for route structure, but content will be English
    citySlug: string;
    storeSlug: string;
  };
}

/**
 * Generates static parameters for store detail pages.
 */
export async function generateStaticParams(): Promise<Array<{ locale: string; citySlug: string; storeSlug: string }>> {
  const storeSlugs = [UNVERPACKT_SAARBRUECKEN_DETAILS.slug]; 
  const citySlugs = ["saarbruecken"]; 

  // If you intend to serve this page only for 'en' or a default locale when strings are hardcoded:
  // return citySlugs.flatMap((citySlug) =>
  //   storeSlugs.map((storeSlug) => ({ locale: 'en', citySlug, storeSlug }))
  // );
  // For now, keeps generating for all locales as per original structure
  return locales.flatMap((locale) =>
    citySlugs.flatMap((citySlug) =>
      storeSlugs.map((storeSlug) => ({ locale, citySlug, storeSlug }))
    )
  );
}

/**
 * Generates metadata for the store detail page with hardcoded English strings.
 */
export async function generateMetadata({ params: paramsPromise }: { params: Promise<{ locale: string; citySlug: string; storeSlug: string; }> }) {
  // Hardcode to always use the "unverpackt-sb" store for the demo
  const params = await paramsPromise;
  const store = UNVERPACKT_SAARBRUECKEN_DETAILS;

  // Assuming citySlug "saarbruecken" translates to "Saarbrücken" for display
  const cityDisplayName = params.citySlug === "saarbruecken" ? "Saarbrücken" : params.citySlug;

  return {
    title: `${store.name} - ${cityDisplayName} Store Details`,
    description: `Find details about ${store.name}: ${store.shortDescription}`,
    // Add more metadata like OpenGraph, alternates for locales, etc.
  };
}

/**
 * The main route component for /[locale]/explore/[citySlug]/[storeSlug].
 */
export default async function StoreDetailRoute({ params }: StoreDetailsRouteProps): Promise<ReactElement> {
  // Hardcode to always use the "unverpackt-sb" store for the demo
  const store = UNVERPACKT_SAARBRUECKEN_DETAILS;
  
  // Get citySlug from params but fallback to "saarbruecken" if needed
  const citySlug = params.citySlug || "saarbruecken";

  return (
    <StoreDetailsPage store={store} citySlug={citySlug} />
  );
} 