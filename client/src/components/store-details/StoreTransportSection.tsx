"use client";

import type { ReactElement } from 'react';
import type { ParkingOption, PublicTransportStop, AccessibilityFeature } from '@/types/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Car, Bus, Train, PersonStanding, MapPin, ParkingCircle, Accessibility as AccessibilityIcon, 
  CheckCircle2, XCircle, AlertTriangle, Info, ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';

/**
 * @file src/components/store-details/StoreTransportSection.tsx
 * @description Section displaying nearby parking and public transport options (English strings hardcoded).
 */

/**
 * Dynamically get a Lucide icon component by its name.
 */
const DynamicLucideIcon = ({ name, ...props }: { name: string } & LucideIcons.LucideProps): ReactElement | null => {
  const IconComponent = (LucideIcons as any)[name];
  if (!IconComponent) return <AccessibilityIcon {...props} />;
  return <IconComponent {...props} />;
};

interface StoreTransportSectionProps {
  nearbyParking: ParkingOption[];
  nearbyPublicTransport: PublicTransportStop[];
  storeName: string;
  storeCoordinates: { lat: number; lng: number };
}

interface AccessibilityChipProps {
  feature: AccessibilityFeature;
}

const AccessibilityChip: React.FC<AccessibilityChipProps> = ({ feature }) => {
  let StatusIcon, iconColor, bgColor;

  switch (feature.status) {
    case true:
      StatusIcon = CheckCircle2;
      iconColor = "text-green-700 dark:text-green-400";
      bgColor = "bg-green-100 dark:bg-green-900";
      break;
    case false:
      StatusIcon = XCircle;
      iconColor = "text-red-700 dark:text-red-400";
      bgColor = "bg-red-100 dark:bg-red-900";
      break;
    default: 
      StatusIcon = AlertTriangle;
      iconColor = "text-yellow-700 dark:text-yellow-400";
      bgColor = "bg-yellow-100 dark:bg-yellow-900";
      break;
  }

  return (
    <div title={feature.feature + (feature.details ? `: ${feature.details}` : '')} 
         className={cn("inline-flex items-center space-x-1.5 pl-1 pr-2 py-0.5 rounded-full text-xs font-medium", bgColor, iconColor)}>
      <StatusIcon className={cn("w-3.5 h-3.5")} />
      <span>{feature.feature}</span>
    </div>
  );
};

/**
 * Renders the transport section.
 */
export default function StoreTransportSection({ nearbyParking, nearbyPublicTransport, storeName, storeCoordinates }: StoreTransportSectionProps): ReactElement {
  const transportModeIcon = (mode: string): ReactElement => {
    switch (mode) {
      case 'bus': return <Bus className="w-4 h-4 mr-1 text-primary" />;
      case 'tram': return <Train className="w-4 h-4 mr-1 text-primary" />;
      case 'train': return <Train className="w-4 h-4 mr-1 text-primary" />;
      default: return <PersonStanding className="w-4 h-4 mr-1 text-primary" />;
    }
  };

  const hasParking = nearbyParking && nearbyParking.length > 0;
  const hasPublicTransport = nearbyPublicTransport && nearbyPublicTransport.length > 0;

  if (!hasParking && !hasPublicTransport) {
    return <></>; 
  }

  return (
    <section aria-labelledby="transport-heading">
      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="bg-muted/50">
          <div className="flex items-center space-x-3">
            <ParkingCircle className="h-6 w-6 text-primary" />
            <CardTitle id="transport-heading" className="text-2xl md:text-3xl">
              {`Getting to ${storeName}`}
            </CardTitle>
          </div>
          <CardDescription className="pt-2 text-sm md:text-base">
            Parking and public transport options nearby.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {hasParking && (
            <div id="parking-options">
              <div className="flex items-center mb-4">
                <Car className="h-5 w-5 text-primary mr-2" />
                <h4 className="text-xl font-semibold text-foreground">Parking</h4>
              </div>
              <ul className="space-y-4">
                {nearbyParking.map((option, index) => (
                  <li key={`parking-${index}`} className="p-4 border rounded-lg bg-background hover:shadow-md transition-shadow">
                    <h5 className="font-semibold text-foreground">{option.name}</h5>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" /> 
                      {option.address}
                    </p>
                    {option.distance && (
                      <p className="text-sm text-muted-foreground mt-1">{option.distance}</p>
                    )}
                    {option.coordinates && (
                        <a 
                            href={`https://www.google.com/maps/dir/?api=1&destination=${option.coordinates.lat},${option.coordinates.lng}&origin=${storeCoordinates.lat},${storeCoordinates.lng}`}
                            target="_blank" rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline mt-1 inline-flex items-center"
                        >
                            Get Directions
                            <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                    )}
                    {option.accessibilityFeatures && option.accessibilityFeatures.length > 0 && (
                      <div className="mt-2 space-x-2 space-y-1">
                        {option.accessibilityFeatures.map((feat, idx) => (
                          <AccessibilityChip key={`parking-feat-${idx}`} feature={feat} />
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {hasPublicTransport && (
            <div id="public-transport-options">
              <div className="flex items-center mb-4">
                <Bus className="h-5 w-5 text-primary mr-2" />
                <h4 className="text-xl font-semibold text-foreground">Public Transport</h4>
              </div>
              <ul className="space-y-4">
                {nearbyPublicTransport.map((stop, index) => (
                  <li key={`transport-${index}`} className="p-4 border rounded-lg bg-background hover:shadow-md transition-shadow">
                    <h5 className="font-semibold text-foreground">{stop.name}</h5>
                    <div className="text-sm text-muted-foreground flex items-center my-1">
                      {stop.modes.map(mode => transportModeIcon(mode))}
                      {stop.lines && <span>{stop.lines}</span>}
                    </div>
                    {stop.distance && (
                      <p className="text-sm text-muted-foreground">{stop.distance}</p>
                    )}
                     <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(stop.name)}&travelmode=transit&origin=${storeCoordinates.lat},${storeCoordinates.lng}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline mt-1 inline-flex items-center"
                    >
                        Get Directions (Transit)
                        <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                    {stop.accessibilityFeatures && stop.accessibilityFeatures.length > 0 && (
                      <div className="mt-2 space-x-2 space-y-1">
                        {stop.accessibilityFeatures.map((feat, idx) => (
                          <AccessibilityChip key={`transport-feat-${idx}`} feature={feat} />
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
} 