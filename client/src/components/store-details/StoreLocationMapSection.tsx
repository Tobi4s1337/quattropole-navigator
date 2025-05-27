"use client";

import type { ReactElement } from 'react';
import type { StoreDetails } from '@/types/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin, Navigation } from 'lucide-react';
import MapView from '@/components/listing/MapView';
import type { ShoppingItemType } from '@/types/explore';
import { Button } from '@/components/ui/button';

/**
 * @file src/components/store-details/StoreLocationMapSection.tsx
 * @description Section displaying the store's location on a map.
 */

/**
 * Props for StoreLocationMapSection.
 * @interface StoreLocationMapSectionProps
 * @property {Pick<StoreDetails, 'id' | 'name' | 'coordinates' | 'addressLine1' | 'city'>} store - Store data for map display.
 */
interface StoreLocationMapSectionProps {
  store: Pick<StoreDetails, 'id' | 'name' | 'coordinates' | 'addressLine1' | 'city'>;
}

/**
 * Renders a section with a map showing the store's location.
 */
export default function StoreLocationMapSection({ store }: StoreLocationMapSectionProps): ReactElement {
  // Adapt StoreDetails to the ShoppingItemType format expected by MapView
  const mapItem: ShoppingItemType = {
    id: store.id,
    name: store.name, // Use direct name instead of nameKey
    image: ' ', // MapView might not use this for a single item
    category: 'Zero-Waste Store', // Hardcoded category
    coordinates: store.coordinates,
    address: store.addressLine1, // Use direct address instead of addressKey
  };

  // Generate Google Maps directions URL
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${store.coordinates.lat},${store.coordinates.lng}`;

  return (
    <section aria-labelledby="location-map-heading" className="overflow-hidden rounded-xl shadow-xl">
      <div className="bg-muted/50 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <MapPin size={24} className="text-primary" /> 
            <h2 id="location-map-heading" className="text-2xl md:text-3xl font-bold">
              Store Location
            </h2>
          </div>
          <p className="text-muted-foreground">
            Find {store.name} at {store.addressLine1}, {store.city}
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button asChild size="sm" variant="outline" className="h-9">
            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
              <Navigation className="mr-2 h-4 w-4" />
              Get Directions
            </a>
          </Button>
          <Button asChild size="sm" variant="secondary" className="h-9">
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${store.coordinates.lat},${store.coordinates.lng}`} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <MapPin className="mr-2 h-4 w-4" />
              View Larger Map
            </a>
          </Button>
        </div>
      </div>
      
      <div className="aspect-[16/9] md:aspect-[2/1] lg:aspect-[21/9] relative">
        <div className="absolute inset-0">
          <MapView items={[mapItem]} />
        </div>
        
        {/* Map overlay with pointer to enhance the visuals */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm shadow-lg p-3 rounded-lg text-sm max-w-xs">
          <div className="font-medium flex items-center gap-2 mb-1">
            <MapPin className="h-4 w-4 text-primary" />
            {store.name}
          </div>
          <div className="text-muted-foreground text-xs">
            {store.addressLine1}, {store.city}
          </div>
        </div>
      </div>
    </section>
  );
} 