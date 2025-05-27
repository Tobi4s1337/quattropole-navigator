"use client";

import type { ReactElement } from 'react';
import Image from 'next/image';
import type { StoreDetails, Image as StoreImageCustom } from '@/types/store'; // Renamed to avoid conflict
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';

/**
 * @file src/components/store-details/StoreHeroSection.tsx
 * @description Hero section for the store details page.
 */

interface StoreHeroSectionProps {
  store: {
    name: string;
    shortDescription: string;
    category: string;
    heroImages: StoreImageCustom[];
    logo?: StoreImageCustom;
  };
}

/**
 * Renders the hero section for a store.
 */
export default function StoreHeroSection({ store }: StoreHeroSectionProps): ReactElement {
  // Use the specific image URL requested for the hero banner
  const bannerImageUrl = "https://einkaufen.saarbruecken.de/cache/media/attachments/2023/12/107452_x_y_52ec53_12.jpg";

  return (
    <section aria-labelledby="store-hero-heading" className="relative w-full h-[500px] md:h-[550px] lg:h-[650px] overflow-hidden group">
      {/* Gradient overlays for better text visibility and visual appeal */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent z-10" />
      
      {/* Hero image with subtle zoom effect on hover */}
      <Image 
        src={bannerImageUrl}
        alt={`Storefront of ${store.name}`}
        fill
        sizes="100vw"
        priority
        className="object-cover object-center transition-transform duration-10000 group-hover:scale-105"
        quality={90}
      />
      
      {/* Decorative diagonal patterns */}
      <div className="absolute top-0 right-0 w-full h-full z-5 opacity-20 bg-[radial-gradient(circle_at_top_right,_#ffffff22_0%,_transparent_60%)]"></div>
      
      {/* Content container */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end">
        <div className="container mx-auto px-4 pb-20 md:pb-28 lg:pb-32">
          <div className="max-w-4xl">
            {/* Category badge */}
            <Badge 
              variant="secondary" 
              className="mb-4 bg-primary/90 text-primary-foreground backdrop-blur-sm text-xs md:text-sm py-1 px-3 shadow-md"
            >
              {store.category}
            </Badge>
            
            {/* Store name with decorative underline */}
            <h1 
              id="store-hero-heading" 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-4 drop-shadow-sm relative inline-block"
            >
              {store.name}
              <span className="absolute -bottom-2 left-0 w-1/3 h-1 bg-primary rounded-full"></span>
            </h1>
            
            {/* Short description */}
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mb-8 leading-relaxed drop-shadow-sm">
              {store.shortDescription}
            </p>
            
            {/* Action buttons - replaced restaurant specific ones with appropriate actions */}
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-md">
                <Navigation className="mr-2 h-4 w-4" />
                Get Directions
              </Button>
              <Button size="lg" variant="secondary" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white/20 shadow-md">
                <MapPin className="mr-2 h-4 w-4" />
                View on Map
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Store logo */}
      {store.logo && (
        <div className="absolute top-8 right-8 md:right-12 z-30">
          <div className="bg-white/90 backdrop-blur-sm p-2 md:p-3 rounded-xl w-16 h-16 md:w-24 md:h-24 flex items-center justify-center shadow-xl border border-white/20 transform hover:scale-105 transition-transform">
            <Image 
              src={store.logo.url} 
              alt={store.logo.altText} 
              width={80}
              height={80}
              className="object-contain rounded"
            />
          </div>
        </div>
      )}
    </section>
  );
} 