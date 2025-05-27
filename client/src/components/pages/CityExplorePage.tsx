"use client";

import type { ReactElement } from 'react';
import { useTranslations } from 'next-intl';
// We will import the new components here later
// import HeroSection from '@/components/explore/HeroSection';
import EventsCarousel from '@/components/explore/EventsCarousel';
import SightseeingCarousel from '@/components/explore/SightseeingCarousel';
import type { CityExploreData } from '@/types/explore';
import HeroSection from '@/components/explore/HeroSection'; // Import HeroSection
import ShoppingCarousel from '@/components/explore/ShoppingCarousel'; // Import ShoppingCarousel
import GastronomyCarousel from '@/components/explore/GastronomyCarousel'; // Import GastronomyCarousel
import { Calendar, Landmark, ShoppingBag, Utensils, ArrowRight } from 'lucide-react'; // Import icons
import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * @file CityExplorePage.tsx
 * @description Main component to display the exploration page for a specific city.
 * It will fetch and orchestrate the display of various sections like Hero, Events, and Sightseeing.
 */

/**
 * Props for the CityExplorePage component.
 * @interface CityExplorePageProps
 * @property {string} citySlug - The slug of the city to display (e.g., "saarbruecken").
 * @property {CityExploreData} cityData - The pre-fetched data for the city.
 */
interface CityExplorePageProps {
  citySlug: string;
  cityData: CityExploreData; 
}

/**
 * Renders the explore page for a given city.
 * This component will be responsible for laying out the hero section,
 * events carousel, and sightseeing carousel with enhanced visual appeal.
 *
 * @param {CityExplorePageProps} props - The props for the component.
 * @returns {ReactElement} The rendered city explore page.
 */
export default function CityExplorePage({ citySlug, cityData }: CityExplorePageProps): ReactElement {
  const t = useTranslations('CityExplorePage'); // Namespace for this page's translations
  const tCity = useTranslations('Cities');

  // Now we can use cityData to render the page content
  // For example, to get the translated city name:
  const cityName = tCity(cityData.cityNameKey);

  // Assume cityData is extended with shopping and gastronomy data
  // const { events, sights, shopping, gastronomy } = cityData;

  return (
    <main className="flex-1 flex flex-col items-center bg-background">
      <HeroSection cityData={cityData} />
      
      {/* Events Section - Enhanced Styling */}
      <section id="events-section" className="w-full py-16 md:py-24 bg-muted/30 relative overflow-hidden">
        {/* Decorative element - top right */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 md:w-96 md:h-96 bg-primary/5 rounded-full blur-3xl -z-0" aria-hidden="true" />
        
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="md:flex md:items-center md:justify-between mb-8 md:mb-12 relative">
            {/* Large decorative calendar icon - positioned near headline */}
            <div className="absolute top-0 right-0 md:right-0 opacity-10 pointer-events-none z-0" aria-hidden="true">
              <Calendar className="w-36 h-36 md:w-56 md:h-56" strokeWidth={1} />
            </div>
            
            <div className="md:max-w-xl lg:max-w-2xl text-center md:text-left relative z-10">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                {t('eventsSectionTitle', { cityName })}
              </h2>
              <p className="mt-3 md:mt-4 text-lg text-muted-foreground sm:text-xl">
                {t('eventsSectionSubtitle')}
              </p>
              <Link 
                href={`/explore/${citySlug}/events`} 
                className="mt-4 inline-flex items-center text-primary font-medium hover:text-primary/80 transition-colors group"
              >
                {t('viewAllEvents')}
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
          <EventsCarousel events={cityData.events} />
        </div>
      </section>

      {/* Sightseeing Section - Enhanced Styling (Mirrored) */}
      <section id="attractions-section" className="w-full py-16 md:py-24 bg-background relative overflow-hidden">
         {/* Decorative element - bottom left */}
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 md:w-96 md:h-96 bg-secondary/5 rounded-full blur-3xl -z-0" aria-hidden="true" />
        
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="md:flex md:items-center md:justify-between mb-8 md:mb-12 relative">
            {/* Empty div to take up space on the left */}
            <div className="md:w-1/3 hidden md:block" />
            
            {/* Large decorative landmark icon - positioned near headline */}
            <div className="absolute top-0 left-0 md:left-0 opacity-10 pointer-events-none z-0" aria-hidden="true">
              <Landmark className="w-36 h-36 md:w-56 md:h-56" strokeWidth={1} />
            </div>
            
            {/* Title block now correctly on the right */}
            <div className="md:w-2/3 md:max-w-xl lg:max-w-2xl text-center md:text-right relative z-10">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                {t('sightsSectionTitle', { cityName })}
              </h2>
              <p className="mt-3 md:mt-4 text-lg text-muted-foreground sm:text-xl">
                {t('sightsSectionSubtitle')}
              </p>
              <Link 
                href={`/explore/${citySlug}/sights`} 
                className="mt-4 inline-flex items-center text-primary font-medium hover:text-primary/80 transition-colors group justify-center md:justify-end w-full"
              >
                {t('viewAllSights')}
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
          <SightseeingCarousel sights={cityData.sights} />
        </div>
      </section>

      {/* Shopping Section - Enhanced Styling */}
      <section id="shopping-section" className="w-full py-16 md:py-24 bg-muted/30 relative overflow-hidden">
        {/* Decorative element - top left, different shape/color */}
        <div 
          className="absolute top-0 left-0 -translate-y-1/4 -translate-x-1/4 w-72 h-72 md:w-96 md:h-96 bg-accent/10 rounded-full blur-3xl -z-0" 
          style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} /* Diamond shape */
          aria-hidden="true" 
        />
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="md:flex md:items-center md:justify-start mb-8 md:mb-12 relative">
            {/* Large decorative shopping bag icon */}
            <div className="absolute top-1/2 right-0 md:right-auto md:left-full md:-translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none z-0 transform scale-x-[-1] md:scale-x-[1]" aria-hidden="true">
              <ShoppingBag className="w-40 h-40 md:w-56 md:h-56" strokeWidth={0.8} />
            </div>
            <div className="md:max-w-xl lg:max-w-2xl text-center md:text-left relative z-10">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                {t('shoppingSectionTitle', { cityName })}
              </h2>
              <p className="mt-3 md:mt-4 text-lg text-muted-foreground sm:text-xl">
                {t('shoppingSectionSubtitle')}
              </p>
              <Link 
                href={`/explore/${citySlug}/shopping`} 
                className="mt-4 inline-flex items-center text-primary font-medium hover:text-primary/80 transition-colors group"
              >
                {t('viewAllShops')}
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
          <ShoppingCarousel shoppingItems={cityData.shopping || []} />
        </div>
      </section>

      {/* Gastronomy Section - New Enhanced Styling */}
      <section id="gastronomy-section" className="w-full py-16 md:py-24 bg-background relative overflow-hidden">
        {/* Decorative element - bottom right, unique style */}
        <div 
          className="absolute bottom-0 right-0 translate-y-1/3 translate-x-1/3 w-80 h-80 md:w-[450px] md:h-[450px] bg-primary/5 -z-0" 
          style={{
            borderRadius: '60% 40% 30% 70% / 70% 30% 70% 30%', // Organic blob shape
            animation: 'blobRotate 20s infinite linear' 
          }}
          aria-hidden="true" 
        />
        {/* CSS for animation (should be in a global CSS file ideally) */}
        <style jsx global>{`
          @keyframes blobRotate {
            0% { transform: translate(calc(33% + 0px), calc(33% + 0px)) rotate(0deg); }
            25% { transform: translate(calc(33% + 5px), calc(33% - 5px)) rotate(90deg); }
            50% { transform: translate(calc(33% - 5px), calc(33% + 5px)) rotate(180deg); }
            75% { transform: translate(calc(33% + 0px), calc(33% - 0px)) rotate(270deg); }
            100% { transform: translate(calc(33% + 0px), calc(33% + 0px)) rotate(360deg); }
          }
        `}</style>

        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="md:flex md:items-center md:justify-end mb-8 md:mb-12 relative">
             {/* Large decorative utensils icon */}
            <div className="absolute top-1/2 left-0 md:left-auto md:right-full md:translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none z-0" aria-hidden="true">
              <Utensils className="w-40 h-40 md:w-56 md:h-56" strokeWidth={0.8} />
            </div>
            <div className="md:w-2/3 md:max-w-xl lg:max-w-2xl text-center md:text-right relative z-10">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                {t('gastronomySectionTitle', { cityName })}
              </h2>
              <p className="mt-3 md:mt-4 text-lg text-muted-foreground sm:text-xl">
                {t('gastronomySectionSubtitle')}
              </p>
              <Link 
                href={`/explore/${citySlug}/restaurants`} 
                className="mt-4 inline-flex items-center text-primary font-medium hover:text-primary/80 transition-colors group justify-center md:justify-end w-full"
              >
                {t('viewAllRestaurants')}
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
          <GastronomyCarousel gastronomyItems={cityData.gastronomy || []} />
        </div>
      </section>
    </main>
  );
} 