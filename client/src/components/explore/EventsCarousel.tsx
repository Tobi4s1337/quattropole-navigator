"use client";

import type { ReactElement } from 'react';
import Autoplay from "embla-carousel-autoplay";

import type { EventType } from '@/types/explore';
import EventCard from './EventCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

/**
 * @file EventsCarousel.tsx
 * @description A carousel component to display a list of events.
 */

/**
 * Props for the EventsCarousel component.
 * @interface EventsCarouselProps
 * @property {EventType[]} events - An array of event data to display in the carousel.
 */
interface EventsCarouselProps {
  events: EventType[];
}

/**
 * Renders a carousel of EventCard components.
 * Displays a horizontally scrollable list of events, with autoplay functionality.
 *
 * @param {EventsCarouselProps} props - The props for the component.
 * @returns {ReactElement | null} The rendered events carousel, or null if no events are provided.
 */
export default function EventsCarousel({ events }: EventsCarouselProps): ReactElement | null {
  if (!events || events.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p>No upcoming events at the moment. Check back soon!</p>
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
          delay: 5000, // Autoplay every 5 seconds
          stopOnInteraction: true,
        }),
      ]}
      className="w-full"
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {events.map((event, index) => (
          <CarouselItem key={event.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
            <div className="p-1 h-full">
              <EventCard event={event} isPriority={index < 2} />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2 sm:-left-12 lg:-left-16 hidden md:flex absolute" />
      <CarouselNext className="right-2 sm:-right-12 lg:-right-16 hidden md:flex absolute" />
    </Carousel>
  );
} 