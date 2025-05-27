"/use client";

import type { ReactElement } from 'react';
import type { City } from "@/types/entities";
import CityCard from "./CityCard";
import { useTranslations } from "next-intl";

/**
 * @file CitySelection.tsx
 * @description Component to display a grid of selectable city cards.
 * This section forms the primary interactive part of the landing page,
 * inviting users to explore different cities.
 */

/**
 * Props for the CitySelection component.
 * @interface CitySelectionProps
 * @property {City[]} cities - An array of city data objects to display.
 */
interface CitySelectionProps {
  cities: City[];
}

/**
 * Renders a responsive grid of CityCard components.
 * Each card represents a city available for exploration.
 * The layout displays two cities per row with visually appealing spacing.
 *
 * @param {CitySelectionProps} props - The props for the component.
 * @returns {ReactElement} The rendered grid of city cards.
 * @example
 * const CITIES_DATA: City[] = [...]; // Array of City objects
 * <CitySelection cities={CITIES_DATA} />
 */
export default function CitySelection({ cities }: CitySelectionProps): ReactElement {
  const t = useTranslations("IndexPage"); // Namespace for this section's specific translations

  return (
    <div className="w-full">
      <div className="sr-only">
        {/* Title for screen readers */}
        <h2 id="city-selection-title">{t("selectCityTitle")}</h2>
      </div>
      
      {cities && cities.length > 0 ? (
        <div className="relative">
          {/* Colored accents behind cards */}
          <div className="absolute inset-0 grid grid-cols-2 gap-6 md:gap-8 -z-10" aria-hidden="true">
            <div className="bg-[#FFEEB6]/20 rounded-xl h-[90%] w-[95%] self-start justify-self-end" />
            <div className="bg-[#C2C8E1]/20 rounded-xl h-[90%] w-[95%] self-start justify-self-start" />
            <div className="bg-[#BECFBD]/20 rounded-xl h-[90%] w-[95%] self-end justify-self-end" />
            <div className="bg-[#EAEAEA]/30 rounded-xl h-[90%] w-[95%] self-end justify-self-start" />
          </div>
          
          {/* City grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 relative z-10">
            {cities.map((city, index) => (
              <div key={city.id} className="transform transition-all hover:-translate-y-1">
                <CityCard 
                  city={city} 
                  isPriority={index < 2}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-center">
          <p className="text-muted-foreground">{t("noCitiesAvailable")}</p>
        </div>
      )}
    </div>
  );
} 