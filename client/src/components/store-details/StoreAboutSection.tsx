"use client";

import type { ReactElement } from 'react';
// import { useTranslations } from 'next-intl'; // Removed
// import type { StoreDetails } from '@/types/store'; // StoreDetails not needed if we pass direct props
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from 'lucide-react';

/**
 * @file src/components/store-details/StoreAboutSection.tsx
 * @description "About Us" section for the store details page (English strings hardcoded).
 */

/**
 * Props for the StoreAboutSection component.
 * @interface StoreAboutSectionProps
 * @property {Pick<StoreDetails, 'longDescriptionKey' | 'nameKey'>} store - Store data for the about section.
 */
interface StoreAboutSectionProps {
  store: {
    longDescription: string;
    name: string;
  };
}

/**
 * Renders the "About Us" section for a store.
 */
export default function StoreAboutSection({ store }: StoreAboutSectionProps): ReactElement {
  // const t = useTranslations('StoreDetailsPage'); // Removed
  // const tStoreData = useTranslations('StoreData'); // Removed

  return (
    <section aria-labelledby="about-store-heading">
      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="bg-muted/50">
          <div className="flex items-center space-x-3">
            <Info className="h-6 w-6 text-primary" />
            <CardTitle id="about-store-heading" className="text-2xl md:text-3xl">
              {`About ${store.name}`}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 md:p-8 text-base md:text-lg text-foreground/90 leading-relaxed">
          {/* Assuming the long description might contain markdown or simple HTML in the future. 
              For now, rendering as plain text. If complex formatting is needed, 
              a markdown parser or dangerouslySetInnerHTML (with sanitization) would be required. */}
          <p className="whitespace-pre-line">
            {store.longDescription}
          </p>
        </CardContent>
      </Card>
    </section>
  );
} 