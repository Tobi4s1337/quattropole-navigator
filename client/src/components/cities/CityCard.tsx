"/use client";

import type { ReactElement } from 'react';
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { City } from "@/types/entities";
import { cn } from "@/lib/utils";
import { ArrowUpRightFromCircle } from "lucide-react";

/**
 * @file CityCard.tsx
 * @description Component to display a selectable city card.
 * It showcases the city's image, name, and uses its specific brand color,
 * linking to the city's dedicated page.
 */

/**
 * Props for the CityCard component.
 * @interface CityCardProps
 * @property {City} city - The city data object containing details like name, image, color, and link.
 * @property {boolean} [isPriority=false] - Optional. If true, the image will be prioritized for loading (LCP).
 */
interface CityCardProps {
  city: City;
  isPriority?: boolean;
}

/**
 * A visually engaging card component representing a city.
 * Displays a background image, city name with a color accent, a short description,
 * and a link to the city's exploration page. Aims for a professional and creative look.
 *
 * @param {CityCardProps} props - The props for the component.
 * @returns {ReactElement} The rendered city card.
 * @example
 * const luxembourgData: City = {
 *   id: "luxembourg",
 *   nameKey: "Cities.luxembourg",
 *   color: "bg-[#FFEEB6]",
 *   darkColor: "dark:bg-yellow-900",
 *   imageUrl: "https://images.unsplash.com/photo-1560232099-0183041639ac?q=80&w=800&h=600&auto=format&fit=crop",
 *   href: "/explore/luxembourg",
 * };
 * <CityCard city={luxembourgData} isPriority />
 */
export default function CityCard({ city, isPriority = false }: CityCardProps): ReactElement {
  const t = useTranslations(); // Using default namespace for city names (e.g. t("Cities.luxembourg"))

  // Extract the color value without the 'bg-' prefix - assuming format is like "bg-[#FFEEB6]"
  const rawColorValue = city.color.replace(/^bg-\[(.+?)\]$/, "$1");

  return (
    <Link
      href={city.href}
      aria-label={t("IndexPage.exploreCity", { cityName: t(city.nameKey) })}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl h-auto min-h-[340px] sm:min-h-[380px] shadow-lg outline-none transition-all duration-300",
        "bg-card text-card-foreground border border-border/50 hover:border-primary/60", // Neutral card background, border for definition
        "focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-primary"
      )}
    >
      {/* Image container */}
      <div className="relative w-full h-[180px] sm:h-[200px] overflow-hidden">
        <Image
          src={city.imageUrl}
          alt={t(city.nameKey)} 
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 22vw"
          className="object-cover transition-transform duration-300 will-change-transform group-hover:scale-105"
          priority={isPriority}
        />
        {/* Subtle gradient overlay on image to help text pop if it were ever over the image directly */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"
          aria-hidden="true"
        />
      </div>
      
      {/* Content area below image */}
      <div className="relative z-10 p-5 pt-4 flex flex-col flex-grow gap-2">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            {t(city.nameKey)}
          </h3>
          {/* City Color Accent - using the same color in both light and dark modes */}
          <div 
            className="h-2.5 w-10 rounded-full" 
            style={{ backgroundColor: rawColorValue }}
            aria-hidden="true"
          />
        </div>

        <p className="text-sm text-muted-foreground line-clamp-3 flex-grow min-h-[60px]">
          {t(city.descriptionKey)}
        </p>

        <div className="mt-auto pt-3 flex items-center gap-2 text-sm text-primary font-semibold">
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            {t("IndexPage.exploreCityLinkText")}
          </span>
          <ArrowUpRightFromCircle className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-[-1px]" />
        </div>
      </div>
    </Link>
  );
} 