"use client";

import type { ReactElement } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { CalendarDays, ArrowRight } from 'lucide-react';

import type { EventType } from '@/types/explore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/**
 * @file EventCard.tsx
 * @description A card component to display event information within a carousel or grid.
 */

/**
 * Props for the EventCard component.
 * @interface EventCardProps
 * @property {EventType} event - The event data to display.
 * @property {boolean} [isPriority=false] - Optional. If true, the image will be prioritized for loading.
 */
interface EventCardProps {
  event: EventType;
  isPriority?: boolean;
}

/**
 * Renders a visually engaging card for an event.
 * Displays event image, name, date, description, and an optional link.
 *
 * @param {EventCardProps} props - The props for the component.
 * @returns {ReactElement} The rendered event card.
 */
export default function EventCard({ event, isPriority = false }: EventCardProps): ReactElement {
  const t = useTranslations(); // Generic translations for event details and common terms

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg shadow-lg bg-card text-card-foreground h-full transition-all duration-300 ease-in-out hover:shadow-xl">
      <Link href={event.link || '#'} passHref legacyBehavior>
        <a className="block cursor-pointer" target={event.link ? "_blank" : "_self"} rel={event.link ? "noopener noreferrer" : undefined}>
          <div className="relative w-full h-48 sm:h-56 overflow-hidden">
            <Image
              src={event.imageUrl}
              alt={t(event.nameKey)}
              fill
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
              className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
              priority={isPriority}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" aria-hidden="true" />
          </div>
        </a>
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-2">
          <Link href={event.link || '#'} passHref legacyBehavior>
            <a className="hover:text-primary transition-colors" target={event.link ? "_blank" : "_self"} rel={event.link ? "noopener noreferrer" : undefined}>
              {t(event.nameKey)}
            </a>
          </Link>
        </h3>

        <div className="flex items-center text-xs text-muted-foreground mb-2">
          <CalendarDays className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
          <span>{t(event.dateStringKey)}</span>
        </div>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-3 flex-grow">
          {t(event.descriptionKey)}
        </p>

        {event.tagsKeys && event.tagsKeys.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {event.tagsKeys.map((tagKey) => (
              <span 
                key={tagKey} 
                className="px-2 py-0.5 text-xs rounded-full bg-secondary/80 text-secondary-foreground hover:bg-secondary transition-colors"
              >
                {t(tagKey)}
              </span>
            ))}
          </div>
        )}

        {event.link && (
          <Button variant="outline" size="sm" asChild className="mt-auto w-fit group/button">
            <Link href={event.link} target="_blank" rel="noopener noreferrer">
              {t('Common.learnMore')}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover/button:translate-x-1" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
} 