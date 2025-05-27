"use client";

import type { ReactElement } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { MapPin, ExternalLink } from 'lucide-react';

import type { SightseeingSpotType } from '@/types/explore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/**
 * @file SightseeingSpotCard.tsx
 * @description A card component to display sightseeing spot information.
 */

/**
 * Props for the SightseeingSpotCard component.
 * @interface SightseeingSpotCardProps
 * @property {SightseeingSpotType} spot - The sightseeing spot data to display.
 * @property {boolean} [isPriority=false] - Optional. If true, the image will be prioritized for loading.
 */
interface SightseeingSpotCardProps {
  spot: SightseeingSpotType;
  isPriority?: boolean;
}

/**
 * Renders a visually appealing card for a sightseeing spot.
 * Displays spot image, name, address (if available), description, categories, and an optional external link.
 *
 * @param {SightseeingSpotCardProps} props - The props for the component.
 * @returns {ReactElement} The rendered sightseeing spot card.
 */
export default function SightseeingSpotCard({ spot, isPriority = false }: SightseeingSpotCardProps): ReactElement {
  const t = useTranslations(); // Generic translations for spot details and common terms

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg shadow-lg bg-card text-card-foreground h-full transition-all duration-300 ease-in-out hover:shadow-xl">
      <div className="relative w-full h-56 sm:h-64 overflow-hidden">
        <Image
          src={spot.imageUrl}
          alt={t(spot.nameKey)}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
          className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
          priority={isPriority}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent p-4 flex flex-col justify-end">
          <h3 className="text-xl font-bold text-primary-foreground mb-1 line-clamp-2 drop-shadow-sm">
            {t(spot.nameKey)}
          </h3>
          {spot.addressKey && (
            <div className="flex items-center text-xs text-primary-foreground/80 drop-shadow-sm">
              <MapPin className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
              <span className="line-clamp-1">{t(spot.addressKey)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <p className="text-sm text-muted-foreground mb-3 line-clamp-4 flex-grow">
          {t(spot.descriptionKey)}
        </p>

        {spot.categoryKeys && spot.categoryKeys.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {spot.categoryKeys.map((catKey) => (
              <span 
                key={catKey} 
                className="px-2.5 py-1 text-xs rounded-full bg-accent text-accent-foreground hover:bg-accent/80 transition-colors"
              >
                {t(catKey)}
              </span>
            ))}
          </div>
        )}

        {spot.link && (
          <Button variant="ghost" size="sm" asChild className="mt-auto w-fit text-primary hover:text-primary/80 hover:bg-primary/10 group/button">
            <Link href={spot.link} target="_blank" rel="noopener noreferrer">
              {t('Common.viewDetails')}
              <ExternalLink className="ml-2 h-4 w-4 transition-transform duration-200 group-hover/button:translate-x-0.5" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
} 