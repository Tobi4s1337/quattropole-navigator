"use client";

import { Place } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Building, Star, Coffee, Utensils, Landmark, Store, Bed, MapPin, ExternalLinkIcon, MoreHorizontal } from 'lucide-react';
import Image from "next/image";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PlaceCardProps {
  place: Place;
  onHighlightOnMap?: (place: Place) => void; 
  onShowDetails?: (place: Place) => void;
  compact?: boolean;
}

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#333" offset="20%" />
      <stop stop-color="#222" offset="50%" />
      <stop stop-color="#333" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#333" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) => typeof window === 'undefined'
  ? Buffer.from(str).toString('base64')
  : window.btoa(str);

export default function PlaceCard({ place, onHighlightOnMap, onShowDetails, compact = false }: PlaceCardProps) {
  const hasImage = place.imageUrls && place.imageUrls.length > 0;
  const [imgError, setImgError] = useState(false);
  
  const PlaceIcon = useMemo(() => {
    if (!place.categories || place.categories.length === 0) return Building;
    const category = place.categories[0].toLowerCase();
    if (category.includes('cafe') || category.includes('coffee')) return Coffee;
    if (category.includes('restaurant') || category.includes('food')) return Utensils;
    if (category.includes('hotel') || category.includes('accommodation')) return Bed;
    if (category.includes('museum') || category.includes('landmark') || category.includes('historic')) return Landmark;
    if (category.includes('shop') || category.includes('store')) return Store;
    return Building;
  }, [place.categories]);
  
  const getGradient = () => {
    const seed = place.name.length + (place._id?.charCodeAt(place._id.length - 1) || 0);
    const gradients = [
        'from-sky-500/70 to-indigo-500/70',
        'from-emerald-500/70 to-teal-500/70',
        'from-rose-500/70 to-pink-500/70',
        'from-amber-500/70 to-orange-500/70',
        'from-violet-500/70 to-purple-500/70',
    ];
    return gradients[seed % gradients.length];
  };

  const cardBaseClass = "flex flex-col overflow-hidden transition-all duration-300 rounded-lg shadow-md border dark:border-gray-700";
  const cardHoverClass = onHighlightOnMap ? "hover:shadow-xl hover:-translate-y-1 cursor-pointer" : "";
  const cardBgClass = hasImage && !imgError ? "bg-background" : `bg-gradient-to-br ${getGradient()}`;

  return (
    <div 
      className={cn(cardBaseClass, cardHoverClass, cardBgClass, "!p-0")}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        onHighlightOnMap && onHighlightOnMap(place);
      }}
    >
      <div className="relative group h-32 w-full">
        {hasImage && !imgError ? (
          <Image 
            src={place.imageUrls[0]} 
            alt={place.name}
            fill
            className="object-cover transition-transform group-hover:scale-105 duration-300"
            placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PlaceIcon className="w-12 h-12 text-white/80 opacity-80 drop-shadow-sm" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

        {onShowDetails && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2 z-20 h-7 w-7 bg-black/30 hover:bg-black/50 text-white/80 hover:text-white rounded-full backdrop-blur-sm"
            onClick={(e) => { 
              e.stopPropagation();
              onShowDetails(place); 
            }}
            title="Show details"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        )}

        {place.rating && (
          <div className="absolute top-2 left-2 bg-black/30 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1 z-10 text-xs font-semibold text-white shadow-sm">
            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
            <span>{place.rating}</span>
          </div>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 p-2.5 pointer-events-none z-10">
          <h3 className="font-semibold text-sm text-white leading-tight line-clamp-2 drop-shadow-md">{place.name}</h3>
          {place.categories && place.categories.length > 0 && (
            <p className="text-xs text-white/80 line-clamp-1 drop-shadow-sm mt-0.5">{place.categories[0]}</p>
          )}
        </div>
      </div>

      {!compact && (
        <div className="p-2.5 pt-2 bg-background flex-grow">
          {place.address && (
            <div className="flex items-start gap-1.5 text-xs text-muted-foreground mb-1.5">
              <MapPin size={14} className="shrink-0 mt-px" />
              <span className="line-clamp-1">{place.address}</span>
            </div>
          )}
          {place.website && (
            <a 
              href={place.website} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-xs text-primary hover:underline mb-1.5"
            >
              <ExternalLinkIcon size={14} className="shrink-0" />
              <span>Visit website</span>
            </a>
          )}
          {place.categories && place.categories.length > 1 && (
            <div className="flex flex-wrap gap-1 pt-1 border-t dark:border-gray-700/70">
              {place.categories.slice(1, 4).map((category, index) => (
                <Badge key={index} variant="secondary" className="px-1.5 py-0.5 text-xs font-normal">
                  {category}
                </Badge>
              ))}
              {place.categories.length > 4 && (
                <Badge variant="outline" className="px-1.5 py-0.5 text-xs font-normal">+{place.categories.length - 4}</Badge>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 