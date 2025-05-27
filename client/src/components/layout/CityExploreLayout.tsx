"use client";

import type { ReactElement, ReactNode } from 'react';
import IslandNavbar from './IslandNavbar'; // Assuming IslandNavbar is in the same directory
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl'; // Added for translations

/**
 * @file CityExploreLayout.tsx
 * @description Layout component for city exploration pages, featuring the IslandNavbar
 * and a scroll progress indicator.
 */

/**
 * Props for the CityExploreLayout component.
 * @interface CityExploreLayoutProps
 * @property {ReactNode} children - The content to be rendered within the layout.
 * @property {string} citySlug - The slug of the city, passed to IslandNavbar.
 * @property {string} cityNameKey - The translation key for the current city's name.
 */
interface CityExploreLayoutProps {
  children: ReactNode;
  citySlug: string;
  cityNameKey: string; // Added cityNameKey
}

/**
 * Renders the layout for city exploration pages.
 * Includes the IslandNavbar, a scroll progress indicator at the top,
 * and the main content area for the page.
 *
 * @param {CityExploreLayoutProps} props - The props for the component.
 * @returns {ReactElement} The rendered city explore layout.
 */
export default function CityExploreLayout({ children, citySlug, cityNameKey }: CityExploreLayoutProps): ReactElement {
  const tCities = useTranslations('Cities'); // Hook for city names

  const currentCityName = cityNameKey ? tCities(cityNameKey) : citySlug; // Get translated city name

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      {/* Gradient Blur Effect Div - as suggested by user */}
      <div 
        className="fixed top-0 left-0 right-0 h-32 md:h-60 z-40 pointer-events-none"
        style={{
          background: "linear-gradient(rgba(0, 0, 0, 0.12), transparent)",
          backdropFilter: "blur(5px)",
          WebkitBackdropFilter: "blur(5px)", // For Safari compatibility
          maskImage: "linear-gradient(rgb(0, 0, 0) 0%, rgba(0, 0, 0, 0.8) 30%, rgba(0, 0, 0, 0.4) 60%, rgba(0, 0, 0, 0) 100%)",
          WebkitMaskImage: "linear-gradient(rgb(0, 0, 0) 0%, rgba(0, 0, 0, 0.8) 30%, rgba(0, 0, 0, 0.4) 60%, rgba(0, 0, 0, 0) 100%)" // For Safari compatibility
        }}
      />

      <IslandNavbar citySlug={citySlug} currentCityName={currentCityName} />

      {/* Main content area - children will be CityExplorePage */}
      {/* The IslandNavbar is sticky, so main content should flow underneath */}
      <main className="flex-1"> {/* Removed pt-4 */}
        {children}
      </main>

      {/* No explicit footer here, assuming it's part of the main page content or not needed for this layout */}
    </div>
  );
} 