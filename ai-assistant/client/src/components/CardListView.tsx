"use client";

import { Place } from "@/types";
import { useState } from "react";
import PlaceCard from "./PlaceCard";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import PlaceDetailsDialog from "./PlaceDetailsDialog";
import { ChevronRight, ChevronLeft, MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CardListViewProps {
  places: Place[];
  onPlaceSelect?: (place: Place) => void;
}

export default function CardListView({ places, onPlaceSelect }: CardListViewProps) {
  const [placeForDetails, setPlaceForDetails] = useState<Place | null>(null);
  
  if (!places || places.length === 0) {
    return <p className="text-center text-muted-foreground py-4">No places to display.</p>;
  }

  const handleShowDetails = (place: Place) => {
    setPlaceForDetails(place);
  };

  const handleViewOnMapAndCloseDetails = (place: Place) => {
    if (onPlaceSelect) {
      onPlaceSelect(place);
    }
    setPlaceForDetails(null);
  };

  return (
    <div className="w-full pt-1 pb-2">
      <div className="flex justify-between items-center mb-2 pl-1 pr-2">
        <h3 className="text-sm font-semibold text-primary">
          {places.length} {places.length === 1 ? "Place" : "Places"} Found
        </h3>
        {places.length > 3 && (
          <div className="text-xs text-muted-foreground">
            Swipe to see more
          </div>
        )}
      </div>
      
      <Carousel
        opts={{
          align: "start",
          loop: places.length > 3,
          dragFree: true,
        }}
        className="w-full relative group"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {places.map((place) => (
            <CarouselItem key={place._id} className="pl-2 md:pl-3 basis-2/3 sm:basis-1/2 md:basis-2/5 lg:basis-1/3 xl:basis-1/4">
              <div className="transition-all duration-300">
                <PlaceCard 
                  place={place} 
                  onHighlightOnMap={onPlaceSelect}
                  onShowDetails={handleShowDetails}
                  compact
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {places.length > 3 && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <CarouselPrevious className="absolute left-0.5 top-1/2 -translate-y-1/2 z-10 h-7 w-7" variant="ghost">
              <ChevronLeft className="h-5 w-5" />
            </CarouselPrevious>
            <CarouselNext className="absolute right-0.5 top-1/2 -translate-y-1/2 z-10 h-7 w-7" variant="ghost">
              <ChevronRight className="h-5 w-5" />
            </CarouselNext>
          </div>
        )}
      </Carousel>
      
      {places.length > 0 && onPlaceSelect && (
        <div className="pt-2 flex justify-end pr-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs h-8 text-muted-foreground hover:text-primary"
            onClick={() => onPlaceSelect(places[0])}
            title="Show all listed places on the map"
          >
            <MapIcon className="h-3.5 w-3.5 mr-1.5" />
            View on map
          </Button>
        </div>
      )}
      
      {placeForDetails && (
        <PlaceDetailsDialog 
          place={placeForDetails} 
          open={!!placeForDetails} 
          onClose={() => setPlaceForDetails(null)}
          onViewOnMap={() => handleViewOnMapAndCloseDetails(placeForDetails)}
        />
      )}
    </div>
  );
} 