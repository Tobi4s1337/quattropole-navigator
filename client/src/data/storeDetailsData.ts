/**
 * @file src/data/storeDetailsData.ts
 * @description Hardcoded store details data for development and fallback.
 */

import type { StoreDetails } from "@/types/store";

export const UNVERPACKT_SAARBRUECKEN_DETAILS: StoreDetails = {
  id: "unverpackt-sb",
  slug: "unverpackt-saarbruecken",
  name: "Unverpackt Saarbrücken",
  shortDescription:
    "Your zero-waste grocery store in the heart of Saarbrücken.",
  longDescription:
    "Unverpackt Saarbrücken offers a wide range of organic and regional products without disposable packaging. Bring your own containers and help us reduce waste! Our friendly staff is always happy to assist you with your sustainable shopping experience. We believe in a future with less plastic and more conscious consumption.",
  category: "Zero-Waste Store",
  logo: {
    url: "/images/stores/unverpackt-sb/logo.jpg",
    altText: "Unverpackt Saarbrücken Logo",
  },
  heroImages: [
    {
      url: "https://einkaufen.saarbruecken.de/cache/media/attachments/2023/12/107452_x_y_52ec53_12.jpg",
      altText: "Exterior of Unverpackt Saarbrücken store",
    },
    {
      url: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=2070&auto=format&fit=crop",
      altText:
        "Various glass jars with dry goods and ingredients on wooden shelves",
    },
    {
      url: "https://images.unsplash.com/photo-1584475784921-d9dbfd9d17ca?q=80&w=2070&auto=format&fit=crop",
      altText: "Reusable glass jars and containers with zero waste products",
    },
    {
      url: "https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?q=80&w=2070&auto=format&fit=crop",
      altText: "Eco-friendly kitchen items and wooden utensils display",
    },
    {
      url: "https://images.unsplash.com/photo-1506619216599-9d16d0903dfd?",
      altText: "Hand filling reusable container with coffee beans",
    },
  ],
  addressLine1: "Fürstenstraße 15",
  postalCode: "66111",
  city: "Saarbrücken",
  coordinates: { lat: 49.2346, lng: 6.9932 },
  phone: "+49 681 1234567",
  email: "info@unverpackt-saarbruecken.de",
  website: "https://unverpackt-saarbruecken.de",
  socialMediaLinks: {
    instagram: "https://instagram.com/unverpacktsb",
    facebook: "https://facebook.com/unverpacktsb",
  },
  openingHours: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "10:00",
      closes: "18:30",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday"],
      opens: "10:00",
      closes: "16:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Sunday"],
      opens: "00:00",
      closes: "00:00",
    },
  ],
  accessibilityFeatures: [
    { feature: "Level entrance", status: true, icon: "DoorOpen" },
    { feature: "Wide aisles", status: true, icon: "Waypoints" },
    {
      feature: "Accessible restroom",
      status: false,
      details: "No accessible restroom available on-site.",
      icon: "PersonStanding",
    },
    { feature: "Staff assistance available", status: true, icon: "Users" },
    { feature: "Braille signage", status: false, icon: "Glasses" },
    { feature: "Hearing loop system", status: "unknown", icon: "Ear" },
  ],
  nearbyParking: [
    {
      name: "Lampertshof Parking Garage",
      address: "Lampertshof, 66111 Saarbrücken",
      distance: "Approx. 5 min walk",
      coordinates: { lat: 49.235, lng: 6.991 },
      accessibilityFeatures: [
        {
          feature: "Disabled parking spaces",
          status: true,
          icon: "ParkingCircle",
        },
        {
          feature: "Elevator access to all levels",
          status: true,
          icon: "ArrowBigUpDash",
        },
      ],
    },
  ],
  nearbyPublicTransport: [
    {
      name: "Rathaus (City Hall) Stop",
      modes: ["bus", "tram"],
      lines: "Saarbahn S1; Buses 101, 102, 105",
      distance: "Approx. 3 min walk",
      accessibilityFeatures: [
        {
          feature: "Step-free access to platforms",
          status: "partial",
          details:
            "Some platforms offer step-free access, others may require assistance.",
          icon: "PersonStanding",
        },
        {
          feature: "Tactile paving for visually impaired",
          status: true,
          icon: "Waypoints",
        },
      ],
    },
  ],
  paymentMethods: ["Cash", "EC Card", "Mobile Payment"],
  tags: ["Organic", "Regional Products", "Plastic-Free", "Sustainable Living"],
};

// This function would typically fetch data from a CMS or database
// For now, it returns hardcoded data for a specific store slug.
export async function getStoreDetailsBySlug(
  slug: string
): Promise<StoreDetails | null> {
  if (slug === "unverpackt-saarbruecken") {
    return Promise.resolve(UNVERPACKT_SAARBRUECKEN_DETAILS);
  }
  return Promise.resolve(null);
}
