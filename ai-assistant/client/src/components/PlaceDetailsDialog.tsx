"use client";

import { Place } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Building, MapPin, Phone, Globe, Clock, Info, Map, X, Star, ExternalLink, ImageIcon } from 'lucide-react';
import Image from "next/image";
import { useState } from "react";

interface PlaceDetailsDialogProps {
  place: Place;
  open: boolean;
  onClose: () => void;
  onViewOnMap?: () => void;
}

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f6f7f8" offset="0%" />
      <stop stop-color="#edeef1" offset="20%" />
      <stop stop-color="#f6f7f8" offset="40%" />
      <stop stop-color="#f6f7f8" offset="100%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f6f7f8" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) => typeof window === 'undefined'
  ? Buffer.from(str).toString('base64')
  : window.btoa(str);

export default function PlaceDetailsDialog({ place, open, onClose, onViewOnMap }: PlaceDetailsDialogProps) {
  const hasImages = place.imageUrls && place.imageUrls.length > 0;
  const hasWebsite = !!place.website;
  const hasOpeningHours = place.openingHours && Object.keys(place.openingHours).length > 0;
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});
  
  const handleImageError = (index: number) => {
    setImgErrors(prev => ({ ...prev, [index]: true }));
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-lg">
        <DialogClose className="absolute right-3 top-3 z-50 rounded-full bg-background/80 p-1.5 text-muted-foreground hover:bg-background">
          <X className="h-5 w-5" />
        </DialogClose>
        
        {/* Hero Section with Image */}
        <div className="relative w-full">
          {hasImages && !imgErrors[0] ? (
            <div className="relative">
              <AspectRatio ratio={16/9}>
                <Image 
                  src={place.imageUrls[0]} 
                  alt={place.name}
                  fill
                  priority
                  className="object-cover"
                  placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
                  onError={() => handleImageError(0)}
                />
              </AspectRatio>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>
          ) : (
            <div className="w-full h-40 bg-gradient-to-r from-primary/20 to-primary/40 flex items-center justify-center">
              <ImageIcon className="h-12 w-12 text-primary/40" />
            </div>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold drop-shadow-sm">{place.name}</h2>
                {place.categories && place.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {place.categories.map((category, index) => (
                      <Badge key={index} variant="outline" className="bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20">
                        {category}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              {place.rating && (
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-sm">{place.rating}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Content Tabs */}
        <Tabs defaultValue="details" className="w-full px-0">
          <div className="px-4 pt-3 border-b">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              {hasImages && place.imageUrls.length > 1 && (
                <TabsTrigger value="photos">Photos</TabsTrigger>
              )}
              {hasOpeningHours && (
                <TabsTrigger value="hours">Hours</TabsTrigger>
              )}
            </TabsList>
          </div>
          
          <TabsContent value="details" className="p-4 space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {place.address && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-medium">Address</h3>
                    <p className="text-sm text-muted-foreground">{place.address}</p>
                  </div>
                </div>
              )}
              
              {place.phone && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-medium">Phone</h3>
                    <p className="text-sm text-muted-foreground">{place.phone}</p>
                  </div>
                </div>
              )}
              
              {hasWebsite && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-medium">Website</h3>
                    <a 
                      href={place.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      Visit website <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
            
            {place.description && (
              <div className="pt-2 border-t">
                <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  About
                </h3>
                <p className="text-sm text-muted-foreground">{place.description}</p>
              </div>
            )}
            
            <div className="pt-4 flex justify-end border-t">
              <Button onClick={onViewOnMap} className="gap-2">
                <Map className="h-4 w-4" />
                View on Map
              </Button>
            </div>
          </TabsContent>
          
          {hasImages && place.imageUrls.length > 1 && (
            <TabsContent value="photos" className="p-4">
              <Carousel className="w-full">
                <CarouselContent>
                  {place.imageUrls.map((url, index) => (
                    <CarouselItem key={index}>
                      <AspectRatio ratio={4/3} className="bg-muted rounded-md overflow-hidden">
                        {!imgErrors[index] ? (
                          <Image 
                            src={url} 
                            alt={`${place.name} image ${index + 1}`} 
                            fill
                            className="object-cover"
                            placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
                            onError={() => handleImageError(index)}
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-muted">
                            <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                          </div>
                        )}
                      </AspectRatio>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            </TabsContent>
          )}
          
          {hasOpeningHours && (
            <TabsContent value="hours" className="p-4">
              <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Opening Hours
              </h3>
              <div className="space-y-2 text-sm">
                {Object.entries(place.openingHours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between items-center py-2 border-b border-muted last:border-none">
                    <span className="font-medium">{day}</span>
                    <span className="text-muted-foreground">{hours}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 