import type { ReactElement } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import CityExplorePage from '@/components/pages/CityExplorePage';
import { SAARBRUECKEN_EXPLORE_DATA } from "@/data/cityExploreData";
import type { CityExploreData } from "@/types/explore";
import { routing } from "@/i18n/routing";
const { locales } = routing;
import CityExploreLayout from "@/components/layout/CityExploreLayout";
import { notFound } from 'next/navigation';

interface CityExploreRouteProps {
  params: {
    locale: string;
    citySlug: string;
  };
}

export function generateStaticParams() {
  const citySlugs = ["saarbruecken"]; // Add other city slugs here
  return locales.flatMap((locale: string) =>
    citySlugs.map((citySlug: string) => ({ locale, citySlug }))
  );
}

/**
 * Generates metadata for the city explore page.
 * @param {CityExploreRouteProps} props - The component props.
 * @returns {Promise<object>} The metadata object.
 */
export async function generateMetadata({ params }: CityExploreRouteProps) {
  const { locale, citySlug } = params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale: locale, namespace: 'CityExplorePage' });
  
  let cityData: CityExploreData | null = null;
  if (citySlug === "saarbruecken") {
    cityData = SAARBRUECKEN_EXPLORE_DATA;
  } 

  if (!cityData) {
    return {
      title: t("metaTitleNotFound"),
      description: t("metaDescriptionNotFound"),
    };
  }

  const tCityMeta = await getTranslations({ locale: locale, namespace: 'Cities' });
  const cityName = cityData.cityNameKey ? tCityMeta(cityData.cityNameKey) : citySlug.charAt(0).toUpperCase() + citySlug.slice(1);

  return {
    title: t("metaTitle", { cityName }),
    description: t("metaDescription", { cityName }),
  };
}

/**
 * The main route component for /[locale]/explore/[citySlug].
 * It fetches city-specific data and renders the CityExplorePage component
 * wrapped in the CityExploreLayout.
 */
export default async function ExploreCityRoute({ params }: CityExploreRouteProps) {
  const { locale, citySlug } = params;
  setRequestLocale(locale);

  let cityData: CityExploreData | null = null;
  if (citySlug === "saarbruecken") {
    cityData = SAARBRUECKEN_EXPLORE_DATA;
  } else {
    notFound();
  }

  if (!cityData) {
    notFound();
  }

  return (
    <CityExploreLayout citySlug={citySlug} cityNameKey={cityData.cityNameKey}>
      <CityExplorePage citySlug={citySlug} cityData={cityData} />
    </CityExploreLayout>
  );
} 