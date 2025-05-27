"use client";

import type { ReactElement } from 'react';
import Autoplay from "embla-carousel-autoplay";

import type { SightseeingSpotType } from '@/types/explore';
import SightseeingSpotCard from './SightseeingSpotCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

/**
 * @file SightseeingCarousel.tsx
 * @description A carousel component to display a list of sightseeing spots.
 */

/**
 * Props for the SightseeingCarousel component.
 * @interface SightseeingCarouselProps
 * @property {SightseeingSpotType[]} sights - An array of sightseeing spot data to display.
 */
interface SightseeingCarouselProps {
  sights: SightseeingSpotType[];
}

/**
 * Renders a carousel of SightseeingSpotCard components.
 * Displays a horizontally scrollable list of sightseeing spots, with autoplay functionality.
 *
 * @param {SightseeingCarouselProps} props - The props for the component.
 * @returns {ReactElement | null} The rendered sightseeing carousel, or null if no spots are provided.
 */
export default function SightseeingCarousel({ sights }: SightseeingCarouselProps): ReactElement | null {
  if (!sights || sights.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p>No sightseeing spots available at the moment. Check back soon!</p>
      </div>
    );
  }

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      plugins={[
        Autoplay({
          delay: 5500, // Slightly different delay for variety
          stopOnInteraction: true,
        }),
      ]}
      className="w-full"
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {sights.map((spot, index) => (
          <CarouselItem key={spot.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
            <div className="p-1 h-full">
              <SightseeingSpotCard spot={spot} isPriority={index < 2} />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2 sm:-left-12 lg:-left-16 hidden md:flex absolute" />
      <CarouselNext className="right-2 sm:-right-12 lg:-right-16 hidden md:flex absolute" />
    </Carousel>
  );
} 