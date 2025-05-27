"use client";

import type { ReactElement } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ChevronRight, ExternalLink, MapPin, Users, Utensils, Smile, ShoppingBasket } from 'lucide-react'; // Added ShoppingBasket for price_range

import type { GastronomyItem } from '@/types/explore';
import { cn } from '@/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * @file GastronomyCarousel.tsx
 * @description A carousel component to display a list of gastronomy items.
 */

/**
 * Props for the GastronomyCarousel component.
 * @interface GastronomyCarouselProps
 * @property {GastronomyItem[]} gastronomyItems - An array of gastronomy items to display.
 * @property {string} [className] - Optional additional class names for styling.
 */
interface GastronomyCarouselProps {
  gastronomyItems: GastronomyItem[];
  className?: string;
}

/**
 * Renders a single gastronomy item card for the carousel.
 * @param {object} props - The props for the component.
 * @param {GastronomyItem} props.item - The gastronomy item data.
 * @param {ReturnType<typeof useTranslations>} props.t - The translation function for item-specific fields.
 * @param {ReturnType<typeof useTranslations>} props.tGlobal - The translation function for global/generic fields.
 * @returns {ReactElement}
 */
function GastronomyItemCard({ 
  item, 
  t, 
  tGlobal 
}: {
  item: GastronomyItem;
  t: ReturnType<typeof useTranslations>;
  tGlobal: ReturnType<typeof useTranslations>;
}): ReactElement {
  const name = t(item.nameKey);
  const description = t(item.descriptionKey);
  const address = item.addressKey ? t(item.addressKey) : null;
  const cuisine = item.cuisineKey ? tGlobal(item.cuisineKey) : null; // Assuming cuisine keys are global like 'Cuisine.italian'

  const renderPriceRange = (priceRange?: string) => {
    if (!priceRange) return null;
    const count = priceRange.length;
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <span 
            key={i} 
            className={cn(
              "text-xs font-semibold",
              i < count ? "text-primary" : "text-muted-foreground/20"
            )}
          >
            $
          </span>
        ))}
      </div>
    );
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-card group">
      <CardHeader className="p-0 relative min-h-[200px] overflow-hidden">
        <Image 
          src={item.imageUrl}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute top-3 right-3 flex flex-col items-end gap-2 z-10">
          {cuisine && (
            <Badge variant="secondary" className="text-xs font-medium backdrop-blur-md bg-black/30 text-white border-white/40 shadow-sm flex items-center">
              <Utensils className="h-3 w-3 mr-1.5" /> {cuisine}
            </Badge>
          )}
          {item.priceRange && (
            <Badge variant="outline" className="text-xs font-medium backdrop-blur-md bg-black/30 text-white border-white/40 shadow-sm py-1 px-2">
              {renderPriceRange(item.priceRange)}
            </Badge>
          )}
        </div>
        {item.link && (
          <div className="absolute bottom-3 right-3 z-10 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <Button asChild size="sm" variant="secondary" className="bg-primary/90 hover:bg-primary text-primary-foreground shadow-md">
              <Link href={item.link}>
                {tGlobal('General.viewDetails')}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-grow space-y-2.5">
        <CardTitle className="text-lg font-semibold mb-1 text-card-foreground line-clamp-1">{name}</CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-3">{description}</p>
        <div className="pt-2 space-y-1.5">
          {address && (
            <div className="flex items-start text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 mr-1.5 mt-0.5 flex-shrink-0 text-primary/70" />
              <span>{address}</span>
            </div>
          )}
          {item.allowsReservations !== undefined && (
            <div className="flex items-center text-xs">
              <div className={cn(
                "flex items-center w-full py-1 px-2 rounded-md",
                item.allowsReservations 
                  ? "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400"
                  : "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400"
              )}>
                {item.allowsReservations ? (
                  <Smile className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                ) : (
                  <Users className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                )}
                <span className="font-medium">
                  {item.allowsReservations 
                    ? tGlobal('Gastronomy.reservationsRecommended') 
                    : tGlobal('Gastronomy.walkInsWelcome')}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      {item.link && (
        <CardFooter className="p-4 pt-2 border-t border-border/30 mt-auto">
          <Button asChild variant="outline" size="sm" className="w-full text-primary hover:bg-primary/10 hover:text-primary border-primary/30 hover:border-primary/70">
            <Link href={item.link}>
              {tGlobal('General.viewMenuOrBook')} 
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

/**
 * A carousel component to display gastronomy items for a city.
 * Each item is rendered as a card with image, name, description, cuisine, price range, and optional link.
 *
 * @param {GastronomyCarouselProps} props - The props for the component.
 * @returns {ReactElement | null} The rendered gastronomy carousel, or null if no items are provided.
 * @example
 * const mockGastronomyItems = [
 *   { id: 'rest1', nameKey: 'Gastronomy.rest1.name', descriptionKey: 'Gastronomy.rest1.desc', imageUrl: '/placeholder-rest1.jpg', cuisineKey: 'Cuisine.italian', priceRange: '$$', addressKey: 'Gastronomy.rest1.address', link: '#', allowsReservations: true },
 *   { id: 'cafe2', nameKey: 'Gastronomy.cafe2.name', descriptionKey: 'Gastronomy.cafe2.desc', imageUrl: '/placeholder-cafe2.jpg', cuisineKey: 'Cuisine.cafe', priceRange: '$', allowsReservations: false },
 * ];
 * <GastronomyCarousel gastronomyItems={mockGastronomyItems} />
 */
export default function GastronomyCarousel({ gastronomyItems, className }: GastronomyCarouselProps): ReactElement | null {
  const t = useTranslations(); // General scope for item specific name/desc if keys are prefixed (e.g., Gastronomy.restaurantId.name)
  const tGlobal = useTranslations(); // For global keys like 'Cuisine.italian', 'General.viewMenuOrBook', etc.

  if (!gastronomyItems || gastronomyItems.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <p>{tGlobal('General.noGastronomyItems')}</p> {/* Assumes a global translation key */}
      </div>
    );
  }

  return (
    <Carousel 
      opts={{ align: "start", loop: gastronomyItems.length > 3 }}
      className={cn("w-full", className)}
    >
      <CarouselContent className="-ml-4">
        {gastronomyItems.map((item, index) => (
          <CarouselItem key={item.id || index} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
            <GastronomyItemCard item={item} t={t} tGlobal={tGlobal} />
          </CarouselItem>
        ))}
      </CarouselContent>
      {gastronomyItems.length > 3 && <CarouselPrevious className="left-2 sm:-left-12 lg:-left-16 hidden md:flex absolute" />} 
      {gastronomyItems.length > 3 && <CarouselNext className="right-2 sm:-right-12 lg:-right-16 hidden md:flex absolute" />}
    </Carousel>
  );
} 