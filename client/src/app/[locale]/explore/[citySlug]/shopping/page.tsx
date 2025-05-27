"use client"; // This page will use client-side hooks for state management

import type { ReactElement } from "react";
import { useTranslations } from "next-intl";
import { getCityExploreData } from "@/data/cityExploreData";
import type { CityExploreData, FilterGroup, ShoppingItemType } from "@/types/explore";
import { SearchCategory } from "@/types/explore";
import ListingPageLayout from "@/components/listing/ListingPageLayout";
import { notFound } from "next/navigation";
import IslandNavbar from "@/components/layout/IslandNavbar";
import { useState, useEffect } from "react";

/**
 * @file src/app/[locale]/explore/[citySlug]/shopping/page.tsx
 * @description Page for listing all shops in a specific city.
 */

/**
 * Props for the ShoppingListPage component.
 * @interface ShoppingListPageProps
 * @property {{ locale: string; citySlug: string }} params - Route parameters including locale and citySlug.
 */
interface ShoppingListPageProps {
  params: {
    locale: string;
    citySlug: string;
  };
}

// We will use a Client Component that fetches data internally for simplicity here.
// For SSR/SSG with data fetching, you'd typically use an RSC and pass data down,
// or use Next.js's data fetching methods within page.tsx if it were an RSC.

/**
 * Renders the shopping listing page for a given city.
 * Fetches city data and passes it to the ListingPageLayout component.
 *
 * @param {ShoppingListPageProps} props - The props for the component.
 * @returns {Promise<ReactElement>} A promise that resolves to the rendered page or calls notFound().
 */
export default function ShoppingListPage({ params }: ShoppingListPageProps): ReactElement {
  // Extract params synchronously to fix the async error
  const locale = params.locale;
  const citySlug = params.citySlug;
  
  const tCities = useTranslations("Cities");
  const tMetaData = useTranslations("Metadata");
  const [cityName, setCityName] = useState<string>("");

  // Use the fetchData function to handle the async data fetching
  const fetchData = async () => {
    console.log(`Fetching data for ${citySlug} with locale ${locale}`);
    const cityData = await getCityExploreData(citySlug, locale);
    
    if (!cityData) {
      notFound(); // Triggers the not-found page
      return null;
    }
    
    // Set the city name for the navbar
    setCityName(tCities(cityData.cityNameKey));
    return cityData;
  };

  // Initialize data fetch on mount
  useEffect(() => {
    fetchData();
  }, [citySlug, locale]);

  // Render the page
  return (
    <>
      <IslandNavbar citySlug={citySlug} currentCityName={cityName} />
      <div className="pt-16 sm:pt-20">
        <ListingPageLayout
          fetchDataFn={fetchData}
          pageTitleKey="ShoppingListingPage.title"
          searchPlaceholderKey="ShoppingListingPage.searchPlaceholder"
          category={SearchCategory.Shopping}
        />
      </div>
    </>
  );
}

// Note: For dynamic metadata in App Router with client components that fetch data,
// you might need a different pattern or a parent Server Component to handle metadata generation.
// The `generateMetadata` function is typically used in Server Components (page.tsx, layout.tsx).
// Consider creating a `layout.tsx` for this route if specific metadata is critical.

// Example of how generateMetadata would look if this were a Server Component or in a layout:
// export async function generateMetadata({ params }: ShoppingListPageProps): Promise<Metadata> {
//   const { locale, citySlug } = params;
//   const tCities = getTranslator(locale, "Cities"); // Assuming you have a way to get a translator instance
//   const tMetaData = getTranslator(locale, "Metadata");
//   const cityData = await getCityExploreData(citySlug, locale);
//   const cityName = cityData ? tCities(cityData.cityNameKey) : "City";

//   return {
//     title: tMetaData("metaShoppingTitle", { cityName }),
//     description: tMetaData("metaShoppingDescription", { cityName }),
//   };
// } 