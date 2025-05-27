"use client";

import type { ReactElement } from 'react';
import type { StoreDetails } from '@/types/store';
import StoreHeroSection from '@/components/store-details/StoreHeroSection';
import StoreAboutSection from '@/components/store-details/StoreAboutSection';
import StoreOpeningHoursSection from '@/components/store-details/StoreOpeningHoursSection';
import StoreContactInfoSection from '@/components/store-details/StoreContactInfoSection';
import StoreAccessibilitySection from '@/components/store-details/StoreAccessibilitySection';
import StoreTransportSection from '@/components/store-details/StoreTransportSection';
import StoreGallerySection from '@/components/store-details/StoreGallerySection';
import StorePaymentMethodsSection from '@/components/store-details/StorePaymentMethodsSection';
import StoreTagsSection from '@/components/store-details/StoreTagsSection';
import StoreLocationMapSection from '@/components/store-details/StoreLocationMapSection';
import { Separator } from '@/components/ui/separator';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, MapPin, Clock, Navigation, MailOpen, ArrowRight, ArrowRightCircle, Store, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

/**
 * @file src/components/pages/StoreDetailsPage.tsx
 * @description Main client component for displaying detailed information about a store.
 */

/**
 * Props for the StoreDetailsPage component.
 * @interface StoreDetailsPageProps
 * @property {StoreDetails} store - The detailed information about the store.
 * @property {string} citySlug - The slug of the city the store belongs to.
 */
interface StoreDetailsPageProps {
  store: StoreDetails;
  citySlug: string;
}

/**
 * Renders the detailed page for a store, orchestrating various informational sections.
 * This component is designed to be visually rich and informative, focusing on accessibility and practical details.
 *
 * @param {StoreDetailsPageProps} props - The props for the component.
 * @returns {ReactElement} The rendered store details page.
 */
export default function StoreDetailsPage({ store, citySlug }: StoreDetailsPageProps): ReactElement {
  // Assuming citySlug "saarbruecken" translates to "Saarbrücken" for display
  const cityDisplayName = citySlug === "saarbruecken" ? "Saarbrücken" : citySlug;

  // Quick info array for the floating quick info bar
  const quickInfoItems = [
    {
      icon: <MapPin className="h-4 w-4" />,
      text: `${store.addressLine1}, ${store.postalCode} ${store.city}`
    },
    {
      icon: <Clock className="h-4 w-4" />,
      text: store.openingHours.some(hours => 
        (Array.isArray(hours.dayOfWeek) ? hours.dayOfWeek : [hours.dayOfWeek])
          .includes(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][new Date().getDay()])
      ) ? "Open Today" : "Closed Today"
    }
  ];

  return (
    <main className="flex-1 flex flex-col w-full bg-background min-h-screen relative">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-1/2 h-screen bg-primary/5 -skew-x-12 -translate-x-1/4"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-primary/5 -translate-x-1/3 translate-y-1/3"></div>
      </div>
      
      {/* Hero section takes full width */}
      <StoreHeroSection 
        store={{
          name: store.name,
          shortDescription: store.shortDescription,
          category: store.category,
          heroImages: store.heroImages,
          logo: store.logo
        }}
      />

      {/* Sticky quick info bar that appears below hero */}
      <div className="sticky top-0 z-30 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            {quickInfoItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                {item.icon}
                <span>{item.text}</span>
              </div>
            ))}
          </div>
          <div className="hidden md:flex">
            <Button asChild size="sm" variant="secondary" className="h-8 gap-1.5">
              <a href={`mailto:${store.email}`} rel="noopener noreferrer">
                <MailOpen className="h-3.5 w-3.5" />
                <span>Contact</span>
              </a>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12 z-10">
        <div className="mb-10">
          <Link href={`/explore/${citySlug}`} passHref>
            <Button variant="ghost" size="sm" className="text-sm mb-4">
              <ChevronLeft className="mr-1.5 h-4 w-4" />
              {`Back to ${cityDisplayName} Explore`}
            </Button>
          </Link>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary" className="text-xs font-medium">
              {store.category}
            </Badge>
            {store.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs font-medium">
                {tag}
              </Badge>
            ))}
            {store.tags.length > 3 && (
              <Badge variant="outline" className="text-xs font-medium">
                +{store.tags.length - 3} more
              </Badge>
            )}
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 flex items-center">
            {store.name}
            <span className="ml-3 h-2 w-2 rounded-full bg-primary inline-block"></span>
            <span className="ml-2 h-2 w-2 rounded-full bg-primary/60 inline-block"></span>
            <span className="ml-2 h-2 w-2 rounded-full bg-primary/30 inline-block"></span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl">
            {store.shortDescription}
          </p>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          {/* Left column (main info) - uses 8 columns on large screens */}
          <div className="lg:col-span-8 space-y-12">
            <StoreAboutSection store={{ longDescription: store.longDescription, name: store.name }} />
            
            <div className="bg-muted/30 border rounded-xl p-1">
              <StoreAccessibilitySection features={store.accessibilityFeatures} />
            </div>
            
            {store.heroImages.length > 1 && (
              <div className="relative">
                <div className="absolute -top-6 -left-6 h-12 w-12 border-l-2 border-t-2 border-primary/30"></div>
                <div className="absolute -bottom-6 -right-6 h-12 w-12 border-r-2 border-b-2 border-primary/30"></div>
                <StoreGallerySection images={store.heroImages.slice(1)} storeName={store.name} />
              </div>
            )}
            
            <StoreTransportSection 
              nearbyParking={store.nearbyParking} 
              nearbyPublicTransport={store.nearbyPublicTransport} 
              storeName={store.name} 
              storeCoordinates={store.coordinates}
            />
            
            <StoreLocationMapSection 
              store={{
                id: store.id,
                name: store.name,
                coordinates: store.coordinates,
                addressLine1: store.addressLine1,
                city: store.city
              }}
            />
          </div>

          {/* Right column (sidebar-like info) - uses 4 columns on large screens */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28 self-start">
            <div className="rounded-xl overflow-hidden border shadow-lg">
              <div className="bg-gradient-to-r from-primary/20 to-transparent px-4 py-3 border-b">
                <h3 className="font-semibold text-foreground">Store Information</h3>
              </div>
              <div className="divide-y">
                <div className="p-4">
                  <StoreOpeningHoursSection openingHours={store.openingHours} />
                </div>
                <div className="p-4">
                  <StoreContactInfoSection 
                    store={{
                      name: store.name,
                      addressLine1: store.addressLine1,
                      addressLine2: store.addressLine2,
                      postalCode: store.postalCode,
                      city: store.city,
                      phone: store.phone,
                      email: store.email,
                      website: store.website,
                      socialMediaLinks: store.socialMediaLinks
                    }}
                  />
                </div>
              </div>
            </div>
            
            {(store.paymentMethods.length > 0 || store.tags.length > 0) && (
              <div className="rounded-xl overflow-hidden border shadow-lg">
                <div className="divide-y">
                  {store.paymentMethods.length > 0 && (
                    <div className="p-4">
                      <StorePaymentMethodsSection paymentMethods={store.paymentMethods} />
                    </div>
                  )}
                  {store.tags.length > 0 && (
                    <div className="p-4">
                      <StoreTagsSection tags={store.tags} />
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Call-to-action card */}
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5 rounded-xl border shadow-lg text-center">
              <h3 className="font-semibold text-lg mb-3">Visit the Store</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Experience zero-waste shopping firsthand at Unverpackt Saarbrücken.
              </p>
              <div className="flex flex-col gap-2">
                <Button asChild className="w-full">
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${store.coordinates.lat},${store.coordinates.lng}`} 
                     target="_blank" rel="noopener noreferrer">
                    <Navigation className="mr-2 h-4 w-4" />
                    Get Directions
                  </a>
                </Button>
              </div>
            </div>
          </aside>
        </div>

        {/* Nearby Stores Section */}
        <NearbyStoresSection />

        {/* Footer */}
        <Separator className="my-12" />
        <div className="text-center text-muted-foreground text-sm pb-8">
          <p>{`All information about ${store.name} is subject to change. Please verify directly with the store.`}</p>
          <p className="mt-2 text-xs text-muted-foreground/70">Last updated: June 15, 2023</p>
        </div>
      </div>
    </main>
  );
}

/**
 * Component to display nearby stores in the area
 */
function NearbyStoresSection(): ReactElement {
  // This would normally be fetched from an API, but for now we'll use hardcoded data
  const nearbyStores = [
    {
      id: "fairteiler",
      name: "Fairteiler Saarbrücken",
      description: "Community food sharing point with free items to reduce food waste",
      image: "https://images.unsplash.com/photo-1573246123716-6b1782bfc499?q=80&w=500&auto=format&fit=crop",
      distance: "350m"
    },
    {
      id: "ohne-plastik",
      name: "Ohne Plastik Leben",
      description: "Eco-friendly household items and sustainable alternatives to plastic products",
      image: "https://images.unsplash.com/photo-1582559934353-2e47140e7501?q=80&w=500&auto=format&fit=crop",
      distance: "1.2km"
    },
    {
      id: "bio-markt",
      name: "Bio Markt am Staden",
      description: "Organic supermarket with local and regional produce",
      image: "https://images.unsplash.com/photo-1573246123716-6b1782bfc499?q=80&w=500&auto=format&fit=crop",
      distance: "1.5km"
    },
    {
      id: "fairtrade-cafe",
      name: "Weltladen & Café",
      description: "Fair trade products and cozy café with ethical sourcing",
      image: "https://images.unsplash.com/photo-1559305616-3f99cd43e353?q=80&w=500&auto=format&fit=crop",
      distance: "800m"
    }
  ];

  return (
    <section className="mt-16 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">Explore Nearby</h2>
        </div>
        <Button variant="ghost" size="sm" className="gap-1">
          View all <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {nearbyStores.map(store => (
          <div key={store.id} className="group relative overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md">
            {/* Store image with gradient overlay */}
            <div className="relative h-48 w-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
              <div className="absolute bottom-3 left-3 z-20 text-white">
                <div className="flex items-center text-xs font-medium">
                  <Store className="mr-1 h-3 w-3" />
                  <span className="mr-2">{store.distance}</span>
                </div>
              </div>
              <Image 
                src={store.image} 
                alt={store.name} 
                fill
                className="object-cover transition-transform group-hover:scale-105 duration-500"
              />
            </div>
            
            {/* Store info */}
            <div className="p-4">
              <h3 className="text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                {store.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {store.description}
              </p>
              <div className="mt-3">
                <Button variant="link" size="sm" className="px-0 h-7 font-medium text-primary">
                  View Store <ArrowRightCircle className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
} 