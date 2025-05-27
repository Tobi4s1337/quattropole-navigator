"use client";

import type { ReactElement } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ChevronRight, ExternalLink, MapPin, Clock } from 'lucide-react';

import type { ShoppingItem } from '@/types/explore';
import { cn } from '@/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"; // Assuming you have a generic Carousel component
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * @file ShoppingCarousel.tsx
 * @description A carousel component to display a list of shopping items.
 */

/**
 * Props for the ShoppingCarousel component.
 * @interface ShoppingCarouselProps
 * @property {ShoppingItem[]} shoppingItems - An array of shopping items to display.
 * @property {string} [className] - Optional additional class names for styling.
 */
interface ShoppingCarouselProps {
  shoppingItems: ShoppingItem[];
  className?: string;
}

/**
 * Renders a single shopping item card for the carousel.
 * @param {object} props - The props for the component.
 * @param {ShoppingItem} props.item - The shopping item data.
 * @param {ReturnType<typeof useTranslations>} props.t - The translation function.
 * @param {ReturnType<typeof useTranslations>} props.tGlobal - The global translation function.
 * @returns {ReactElement}
 */
function ShoppingItemCard({ 
  item,
  t,
  tGlobal
}: {
  item: ShoppingItem;
  t: ReturnType<typeof useTranslations>;
  tGlobal: ReturnType<typeof useTranslations>;
}): ReactElement {
  const name = t(item.nameKey);
  const description = t(item.descriptionKey);
  const address = item.addressKey ? t(item.addressKey) : null;
  const openingHours = item.openingHoursKey ? t(item.openingHoursKey) : null;

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
        {item.typeKeys && item.typeKeys.length > 0 && (
          <div className="absolute top-3 right-3 flex flex-wrap gap-1.5 z-10">
            {item.typeKeys.map(typeKey => (
              <Badge key={typeKey} variant="secondary" className="text-xs font-medium backdrop-blur-md bg-black/30 text-white border-white/40 shadow-sm">
                {tGlobal(typeKey)}
              </Badge>
            ))}
          </div>
        )}
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
          {openingHours && (
            <div className="flex items-start text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5 mr-1.5 mt-0.5 flex-shrink-0 text-primary/70" />
              <span>{openingHours}</span>
            </div>
          )}
        </div>
      </CardContent>
      {item.link && (
        <CardFooter className="p-4 pt-2 border-t border-border/30 mt-auto">
          <Button asChild variant="outline" size="sm" className="w-full text-primary hover:bg-primary/10 hover:text-primary border-primary/30 hover:border-primary/70">
            <Link href={item.link}>
              {tGlobal('General.viewDetails')} 
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

/**
 * A carousel component to display shopping items for a city.
 * Each item is rendered as a card with an image, name, description, and optional link.
 *
 * @param {ShoppingCarouselProps} props - The props for the component.
 * @returns {ReactElement | null} The rendered shopping carousel, or null if no items are provided.
 * @example
 * const mockShoppingItems = [
 *   { id: 'shop1', nameKey: 'Shopping.shop1.name', descriptionKey: 'Shopping.shop1.desc', imageUrl: '/placeholder-shop1.jpg', addressKey: 'Shopping.shop1.address', typeKeys: ['Categories.boutique'], link: '#' },
 *   { id: 'shop2', nameKey: 'Shopping.shop2.name', descriptionKey: 'Shopping.shop2.desc', imageUrl: '/placeholder-shop2.jpg', openingHoursKey: 'Shopping.shop2.hours', typeKeys: ['Categories.market'] },
 * ];
 * <ShoppingCarousel shoppingItems={mockShoppingItems} />
 */
export default function ShoppingCarousel({ shoppingItems, className }: ShoppingCarouselProps): ReactElement | null {
  const t = useTranslations(); // General scope for item details if keys are prefixed
  const tGlobal = useTranslations(); // For global keys like 'General.viewDetails' or category types

  if (!shoppingItems || shoppingItems.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <p>{tGlobal('General.noShoppingItems')}</p> {/* Assumes a global translation key */}
      </div>
    );
  }

  return (
    <Carousel 
      opts={{ align: "start", loop: shoppingItems.length > 3 }}
      className={cn("w-full", className)}
    >
      <CarouselContent className="-ml-4">
        {shoppingItems.map((item, index) => (
          <CarouselItem key={item.id || index} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
            <ShoppingItemCard item={item} t={t} tGlobal={tGlobal} />
          </CarouselItem>
        ))}
      </CarouselContent>
      {shoppingItems.length > 3 && <CarouselPrevious className="left-2 sm:-left-12 lg:-left-16 hidden md:flex absolute" />} 
      {shoppingItems.length > 3 && <CarouselNext className="right-2 sm:-right-12 lg:-right-16 hidden md:flex absolute" />}
    </Carousel>
  );
} 