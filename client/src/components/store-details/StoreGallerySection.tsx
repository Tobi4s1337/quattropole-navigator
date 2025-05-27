"use client";

import type { ReactElement } from 'react';
import Image from 'next/image';
import type { Image as StoreImage } from '@/types/store'; // Renamed to avoid conflict with NextImage
import { GalleryHorizontalEnd, ZoomIn, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

/**
 * @file src/components/store-details/StoreGallerySection.tsx
 * @description Section displaying a gallery of store images.
 */

/**
 * Props for StoreGallerySection.
 * @interface StoreGallerySectionProps
 * @property {StoreImage[]} images - Array of images for the gallery.
 * @property {string} storeName - The store's name.
 */
interface StoreGallerySectionProps {
  images: StoreImage[];
  storeName: string;
}

/**
 * Renders a gallery section for the store.
 */
export default function StoreGallerySection({ images, storeName }: StoreGallerySectionProps): ReactElement {
  const [visibleCount, setVisibleCount] = useState(6);
  
  if (!images || images.length === 0) {
    return <></>; // Don't render section if no images
  }
  
  const showMore = () => {
    setVisibleCount(Math.min(images.length, visibleCount + 6));
  };
  
  const visibleImages = images.slice(0, visibleCount);
  const hasMoreImages = visibleCount < images.length;

  return (
    <section aria-labelledby="gallery-heading" className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-lg">
      <div className="px-6 pt-6 pb-4 flex flex-wrap justify-between items-center border-b">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 rounded-full p-2">
            <GalleryHorizontalEnd className="h-5 w-5 text-primary" />
          </div>
          <h2 id="gallery-heading" className="text-xl font-semibold tracking-tight">
            Store Gallery
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {images.length} photos of {storeName}
        </p>
      </div>
      
      <div className="p-5 md:p-6">
        {/* Use CSS grid with masonry-like layout */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-5">
          {visibleImages.map((image, index) => {
            // Make the first image span two rows and two columns on larger screens
            const isFirstImage = index === 0;
            const isTallImage = index === 3;
            
            const imageClass = isFirstImage 
              ? "sm:col-span-2 sm:row-span-2 aspect-square sm:aspect-[4/3]" 
              : isTallImage 
                ? "aspect-[3/4]" 
                : "aspect-square";
              
            return (
              <div 
                key={index} 
                className={`relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ${imageClass}`}
              >
                {/* Overlay with zoom indicator */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-30 group-hover:opacity-70 z-10 transition-opacity duration-300 flex items-center justify-center">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
                    <ZoomIn className="w-5 h-5 text-primary" />
                  </div>
                </div>
                
                {/* Image component */}
                <Image 
                  src={image.url}
                  alt={image.altText || `Image of ${storeName} ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Caption on hover for the first image */}
                {isFirstImage && (
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white z-20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-sm font-medium line-clamp-1">{image.altText}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {hasMoreImages && (
          <div className="mt-6 text-center">
            <Button 
              onClick={showMore} 
              variant="outline" 
              className="mx-auto group hover:bg-primary hover:text-primary-foreground"
            >
              <span>View more photos</span>
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
} 