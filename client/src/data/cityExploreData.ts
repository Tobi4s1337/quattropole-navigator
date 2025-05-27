import type {
  CityExploreData,
  EventType,
  SightseeingSpotType,
  ShoppingItemType,
  GastronomyItemType,
  CategoryFilter,
  FilterGroup,
  FilterOption,
} from "@/types/explore";
import { SearchCategory, OpeningDays } from "@/types/explore";

/**
 * @file cityExploreData.ts
 * @description Manages and provides data for city exploration pages.
 * Contains seed data and a mock data fetching function.
 * TODO: Replace with actual API calls when a backend is available.
 */

// Define Saarbruecken specific filter options to be referenced in items
const saarbrueckenShopTypes: FilterOption[] = [
  {
    id: "fashion",
    translationKey: "Filters.Shopping.fashion",
    parentCategory: SearchCategory.Shopping,
    count: 0,
  }, // Counts will be updated by getCityExploreData
  {
    id: "clothing",
    translationKey: "Filters.Shopping.clothing",
    parentCategory: SearchCategory.Shopping,
    count: 0,
  },
  {
    id: "shoes",
    translationKey: "Filters.Shopping.shoes",
    parentCategory: SearchCategory.Shopping,
    count: 0,
  },
  {
    id: "accessories",
    translationKey: "Filters.Shopping.accessories",
    parentCategory: SearchCategory.Shopping,
    count: 0,
  },
  {
    id: "electronics",
    translationKey: "Filters.Shopping.electronics",
    parentCategory: SearchCategory.Shopping,
    count: 0,
  },
  {
    id: "books",
    translationKey: "Filters.Shopping.books",
    parentCategory: SearchCategory.Shopping,
    count: 0,
  },
  {
    id: "homegoods",
    translationKey: "Filters.Shopping.homegoods",
    parentCategory: SearchCategory.Shopping,
    count: 0,
  },
];

const saarbrueckenDistricts: FilterOption[] = [
  {
    id: "stJohann",
    translationKey: "Filters.Districts.stJohann",
    parentCategory: "district",
    count: 0,
  },
  {
    id: "altSaarbruecken",
    translationKey: "Filters.Districts.altSaarbruecken",
    parentCategory: "district",
    count: 0,
  },
  // Add more Saarbrücken districts if applicable, e.g., Nauwieser Viertel, Malstatt
];

const saarbrueckenOpeningDays: FilterOption[] = [
  {
    id: OpeningDays.Monday,
    translationKey: "Filters.OpeningDays.monday",
    parentCategory: "openingDays",
    count: 0,
  },
  {
    id: OpeningDays.Tuesday,
    translationKey: "Filters.OpeningDays.tuesday",
    parentCategory: "openingDays",
    count: 0,
  },
  {
    id: OpeningDays.Wednesday,
    translationKey: "Filters.OpeningDays.wednesday",
    parentCategory: "openingDays",
    count: 0,
  },
  {
    id: OpeningDays.Thursday,
    translationKey: "Filters.OpeningDays.thursday",
    parentCategory: "openingDays",
    count: 0,
  },
  {
    id: OpeningDays.Friday,
    translationKey: "Filters.OpeningDays.friday",
    parentCategory: "openingDays",
    count: 0,
  },
  {
    id: OpeningDays.Saturday,
    translationKey: "Filters.OpeningDays.saturday",
    parentCategory: "openingDays",
    count: 0,
  },
  {
    id: OpeningDays.Sunday,
    translationKey: "Filters.OpeningDays.sunday",
    parentCategory: "openingDays",
    count: 0,
  },
];

const saarbrueckenLabels: FilterOption[] = [
  // Example: { id: "madeInSaarland", translationKey: "Filters.Labels.madeInSaarland", parentCategory: "labels", count: 0 },
];

const saarbrueckenServices: FilterOption[] = [
  {
    id: "clickAndCollect",
    translationKey: "Filters.Services.clickAndCollect",
    parentCategory: "services",
    count: 0,
  },
  {
    id: "homeDelivery",
    translationKey: "Filters.Services.homeDelivery",
    parentCategory: "services",
    count: 0,
  },
  {
    id: "personalShopper",
    translationKey: "Filters.Services.personalShopper",
    parentCategory: "services",
    count: 0,
  },
  {
    id: "taxFree",
    translationKey: "Filters.Services.taxFree",
    parentCategory: "services",
    count: 0,
  },
  {
    id: "giftCards",
    translationKey: "Filters.Services.giftCards",
    parentCategory: "services",
    count: 0,
  },
  {
    id: "accessible",
    translationKey: "Filters.Services.accessible",
    parentCategory: "services",
    count: 0,
  },
  {
    id: "toilets",
    translationKey: "Filters.Services.toilets",
    parentCategory: "services",
    count: 0,
  },
];

const saarbrueckenPaymentMethods: FilterOption[] = [
  {
    id: "amex",
    translationKey: "Filters.PaymentMethods.amex",
    parentCategory: "paymentMethods",
    count: 0,
  },
  {
    id: "cash",
    translationKey: "Filters.PaymentMethods.cash",
    parentCategory: "paymentMethods",
    count: 0,
  },
  {
    id: "digicash",
    translationKey: "Filters.PaymentMethods.digicash",
    parentCategory: "paymentMethods",
    count: 0,
  },
  {
    id: "maestro",
    translationKey: "Filters.PaymentMethods.maestro",
    parentCategory: "paymentMethods",
    count: 0,
  },
  {
    id: "mastercard",
    translationKey: "Filters.PaymentMethods.mastercard",
    parentCategory: "paymentMethods",
    count: 0,
  },
  {
    id: "visa",
    translationKey: "Filters.PaymentMethods.visa",
    parentCategory: "paymentMethods",
    count: 0,
  },
  {
    id: "vpay",
    translationKey: "Filters.PaymentMethods.vpay",
    parentCategory: "paymentMethods",
    count: 0,
  },
];

const saarbrueckenShoppingData: ShoppingItemType[] = [
  {
    id: "shop-europa-galerie",
    nameKey: "CityExplorePage.Saarbruecken.Shopping.shop1.name",
    descriptionKey: "CityExplorePage.Saarbruecken.Shopping.shop1.description",
    imageUrl:
      "https://www.sonaesierra.com/wp-content/webp-express/webp-images/doc-root/wp-content/uploads/2023/03/Europa-Galerie.1-scaled.jpg.webp", // Example image
    addressKey: "CityExplorePage.Saarbruecken.Shopping.shop1.address",
    openingHoursKey: "CityExplorePage.Saarbruecken.Shopping.shop1.hours",
    typeKeys: ["Filters.Shopping.fashion", "Filters.Shopping.homegoods"], // Using full translation keys
    link: "https://www.europa-galerie-saarbruecken.de/",
    districtKey: "Filters.Districts.stJohann",
    openingDays: [
      OpeningDays.Monday,
      OpeningDays.Tuesday,
      OpeningDays.Wednesday,
      OpeningDays.Thursday,
      OpeningDays.Friday,
      OpeningDays.Saturday,
    ],
    services: [
      "Filters.Services.accessible",
      "Filters.Services.toilets",
      "Filters.Services.giftCards",
    ],
    paymentMethods: [
      "Filters.PaymentMethods.cash",
      "Filters.PaymentMethods.visa",
      "Filters.PaymentMethods.mastercard",
      "Filters.PaymentMethods.maestro",
    ],
    coordinates: { lat: 49.2334, lng: 6.9928 }, // Approx. coords for Europa Galerie
  },
  {
    id: "shop-buecher-koenig",
    nameKey: "CityExplorePage.Saarbruecken.Shopping.shop2.name",
    descriptionKey: "CityExplorePage.Saarbruecken.Shopping.shop2.description",
    imageUrl:
      "https://images.unsplash.com/photo-1573592371950-348a8f1d9f38?q=80&w=2070&auto=format&fit=crop", // Example image
    addressKey: "CityExplorePage.Saarbruecken.Shopping.shop2.address",
    openingHoursKey: "CityExplorePage.Saarbruecken.Shopping.shop2.hours",
    typeKeys: ["Filters.Shopping.books"],
    link: undefined, // No specific link provided
    districtKey: "Filters.Districts.stJohann",
    openingDays: [
      OpeningDays.Monday,
      OpeningDays.Tuesday,
      OpeningDays.Wednesday,
      OpeningDays.Thursday,
      OpeningDays.Friday,
      OpeningDays.Saturday,
    ],
    services: ["Filters.Services.giftCards"],
    paymentMethods: [
      "Filters.PaymentMethods.cash",
      "Filters.PaymentMethods.maestro",
    ],
    coordinates: { lat: 49.2323, lng: 6.995 }, // Approx. coords for St. Johanner Markt area
  },
  {
    id: "shop-saarbasar-electronics",
    nameKey: "CityExplorePage.Saarbruecken.Shopping.shop3.name",
    descriptionKey: "CityExplorePage.Saarbruecken.Shopping.shop3.description",
    imageUrl:
      "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?q=80&w=2080&auto=format&fit=crop", // Example image
    addressKey: "CityExplorePage.Saarbruecken.Shopping.shop3.address",
    openingHoursKey: "CityExplorePage.Saarbruecken.Shopping.shop3.hours",
    typeKeys: ["Filters.Shopping.electronics"],
    link: "https://www.saturn.de/de/store/saarbruecken-saarbasar-66121", // Example, may not be exact store
    districtKey: "Filters.Districts.altSaarbruecken", // Assuming different district
    openingDays: [
      OpeningDays.Monday,
      OpeningDays.Tuesday,
      OpeningDays.Wednesday,
      OpeningDays.Thursday,
      OpeningDays.Friday,
      OpeningDays.Saturday,
    ],
    services: [
      "Filters.Services.clickAndCollect",
      "Filters.Services.homeDelivery",
      "Filters.Services.accessible",
    ],
    paymentMethods: [
      "Filters.PaymentMethods.cash",
      "Filters.PaymentMethods.visa",
      "Filters.PaymentMethods.mastercard",
      "Filters.PaymentMethods.amex",
    ],
    coordinates: { lat: 49.238, lng: 7.0005 }, // Approx. coords for Saarbasar area
  },
  {
    id: "shop-mode-palast",
    nameKey: "CityExplorePage.Saarbruecken.Shopping.shop4.name",
    descriptionKey: "CityExplorePage.Saarbruecken.Shopping.shop4.description",
    imageUrl:
      "https://www.sonaesierra.com/wp-content/webp-express/webp-images/doc-root/wp-content/uploads/2023/03/Europa-Galerie.1-scaled.jpg.webp", // Example image
    addressKey: "CityExplorePage.Saarbruecken.Shopping.shop4.address",
    openingHoursKey: "CityExplorePage.Saarbruecken.Shopping.shop4.hours",
    typeKeys: ["Filters.Shopping.fashion", "Filters.Shopping.accessories"],
    link: undefined,
    districtKey: "Filters.Districts.stJohann",
    openingDays: [
      OpeningDays.Monday,
      OpeningDays.Tuesday,
      OpeningDays.Wednesday,
      OpeningDays.Thursday,
      OpeningDays.Friday,
      OpeningDays.Saturday,
    ],
    services: ["Filters.Services.personalShopper", "Filters.Services.taxFree"],
    paymentMethods: [
      "Filters.PaymentMethods.amex",
      "Filters.PaymentMethods.visa",
      "Filters.PaymentMethods.mastercard",
    ],
    coordinates: { lat: 49.2345, lng: 6.9965 }, // Approx. coords for Bahnhofstraße area
  },
];

export const SAARBRUECKEN_EXPLORE_DATA: CityExploreData = {
  cityId: "saarbruecken",
  cityNameKey: "saarbruecken", // Assumes this key exists in your i18n files under "Cities"
  heroBackgroundImageUrl:
    "https://images.unsplash.com/photo-1589099504341-424c8629247c", // Same as CityCard for now
  availableSearchCategories: [
    SearchCategory.Shopping,
    SearchCategory.Gastronomy,
    SearchCategory.Events,
    SearchCategory.Sightseeing,
  ],
  searchCategoryFilters: {
    [SearchCategory.Shopping]: [
      {
        id: "fashion",
        translationKey: "Filters.Shopping.fashion",
        parentCategory: SearchCategory.Shopping,
      },
      {
        id: "electronics",
        translationKey: "Filters.Shopping.electronics",
        parentCategory: SearchCategory.Shopping,
      },
      {
        id: "books",
        translationKey: "Filters.Shopping.books",
        parentCategory: SearchCategory.Shopping,
      },
      {
        id: "homegoods",
        translationKey: "Filters.Shopping.homegoods",
        parentCategory: SearchCategory.Shopping,
      },
    ],
    [SearchCategory.Gastronomy]: [
      {
        id: "restaurants",
        translationKey: "Filters.Gastronomy.restaurants",
        parentCategory: SearchCategory.Gastronomy,
      },
      {
        id: "cafes",
        translationKey: "Filters.Gastronomy.cafes",
        parentCategory: SearchCategory.Gastronomy,
      },
      {
        id: "bars",
        translationKey: "Filters.Gastronomy.bars",
        parentCategory: SearchCategory.Gastronomy,
      },
      {
        id: "bakeries",
        translationKey: "Filters.Gastronomy.bakeries",
        parentCategory: SearchCategory.Gastronomy,
      },
    ],
    [SearchCategory.Events]: [
      {
        id: "music",
        translationKey: "Filters.Events.music",
        parentCategory: SearchCategory.Events,
      },
      {
        id: "festivals",
        translationKey: "Filters.Events.festivals",
        parentCategory: SearchCategory.Events,
      },
      {
        id: "markets",
        translationKey: "Filters.Events.markets",
        parentCategory: SearchCategory.Events,
      },
      {
        id: "sports",
        translationKey: "Filters.Events.sports",
        parentCategory: SearchCategory.Events,
      },
    ],
    [SearchCategory.Sightseeing]: [
      {
        id: "historical",
        translationKey: "Filters.Sightseeing.historical",
        parentCategory: SearchCategory.Sightseeing,
      },
      {
        id: "museums",
        translationKey: "Filters.Sightseeing.museums",
        parentCategory: SearchCategory.Sightseeing,
      },
      {
        id: "parks",
        translationKey: "Filters.Sightseeing.parks",
        parentCategory: SearchCategory.Sightseeing,
      },
      {
        id: "churches",
        translationKey: "Filters.Sightseeing.churches",
        parentCategory: SearchCategory.Sightseeing,
      },
    ],
  },
  listingPageFilters: {
    [SearchCategory.Shopping]: [
      {
        id: "shopTypes",
        translationKey: "ShoppingListingPage.shopTypesTitle",
        options: saarbrueckenShopTypes,
      },
      {
        id: "district",
        translationKey: "ShoppingListingPage.districtsTitle",
        options: saarbrueckenDistricts,
      },
      {
        id: "openingDays",
        translationKey: "ShoppingListingPage.openingDaysTitle",
        options: saarbrueckenOpeningDays,
      },
      {
        id: "services",
        translationKey: "ShoppingListingPage.servicesTitle",
        options: saarbrueckenServices,
      },
      {
        id: "paymentMethods",
        translationKey: "ShoppingListingPage.paymentMethodsTitle",
        options: saarbrueckenPaymentMethods,
      },
      // { id: "labels", translationKey: "ShoppingListingPage.labelsTitle", options: saarbrueckenLabels }, // Add if labels exist
    ],
    [SearchCategory.Gastronomy]: [], // Placeholder for gastronomy filters
    [SearchCategory.Events]: [], // Placeholder for events filters
    [SearchCategory.Sightseeing]: [], // Placeholder for sightseeing filters
  },
  events: [
    {
      id: "sb-event-1",
      nameKey: "CityExplorePage.Saarbruecken.Events.event1.name",
      descriptionKey: "CityExplorePage.Saarbruecken.Events.event1.description",
      dateStringKey: "CityExplorePage.Saarbruecken.Events.event1.date",
      imageUrl:
        "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=800&h=600&auto=format&fit=crop",
      link: "#",
      tagsKeys: ["Filters.Events.music", "Filters.Events.festivals"],
    },
    {
      id: "sb-event-2",
      nameKey: "CityExplorePage.Saarbruecken.Events.event2.name",
      descriptionKey: "CityExplorePage.Saarbruecken.Events.event2.description",
      dateStringKey: "CityExplorePage.Saarbruecken.Events.event2.date",
      imageUrl:
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&h=600&auto=format&fit=crop",
      link: "#",
      tagsKeys: ["Filters.Events.markets"],
    },
    {
      id: "sb-event-3",
      nameKey: "CityExplorePage.Saarbruecken.Events.event3.name",
      descriptionKey: "CityExplorePage.Saarbruecken.Events.event3.description",
      dateStringKey: "CityExplorePage.Saarbruecken.Events.event3.date",
      imageUrl:
        "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=800&h=600&auto=format&fit=crop",
      link: "#",
      tagsKeys: ["Filters.Events.music"],
    },
  ],
  sights: [
    {
      id: "sb-sight-1",
      nameKey: "CityExplorePage.Saarbruecken.Sights.sight1.name", // e.g. Saarbrücken Castle
      descriptionKey: "CityExplorePage.Saarbruecken.Sights.sight1.description",
      imageUrl:
        "https://images.unsplash.com/photo-1706112790796-bbea0f503071",
      addressKey: "CityExplorePage.Saarbruecken.Sights.sight1.address",
      categoryKeys: [
        "Filters.Sightseeing.historical",
        "Filters.Sightseeing.museums",
      ],
    },
    {
      id: "sb-sight-2",
      nameKey: "CityExplorePage.Saarbruecken.Sights.sight2.name", // e.g. Ludwigskirche
      descriptionKey: "CityExplorePage.Saarbruecken.Sights.sight2.description",
      imageUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT56qS6FnXg9v4Js7_-pXLaBtbJcwgjHxv6qw&s",
      categoryKeys: [
        "Filters.Sightseeing.churches",
        "Filters.Sightseeing.historical",
      ],
    },
    {
      id: "sb-sight-3",
      nameKey: "CityExplorePage.Saarbruecken.Sights.sight3.name", // e.g. Deutsch-Französischer Garten
      descriptionKey: "CityExplorePage.Saarbruecken.Sights.sight3.description",
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/3/38/20110605Deutsch-Franzoesischer_Garten8.jpg",
      categoryKeys: ["Filters.Sightseeing.parks"],
    },
  ],
  shopping: saarbrueckenShoppingData,
  gastronomy: [
    {
      id: "sb-gastro-1",
      nameKey: "CityExplorePage.Saarbruecken.Gastronomy.gastro1.name",
      descriptionKey:
        "CityExplorePage.Saarbruecken.Gastronomy.gastro1.description",
      imageUrl:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070&auto=format&fit=crop", // Elegant restaurant
      cuisineKey: "Cuisine.european",
      priceRange: "$$$",
      addressKey: "CityExplorePage.Saarbruecken.Gastronomy.gastro1.address",
      allowsReservations: true,
      link: "/explore/saarbruecken/restaurant/staden",
    },
    {
      id: "sb-gastro-2",
      nameKey: "CityExplorePage.Saarbruecken.Gastronomy.gastro2.name",
      descriptionKey:
        "CityExplorePage.Saarbruecken.Gastronomy.gastro2.description",
      imageUrl:
        "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?q=80&w=2070&auto=format&fit=crop", // Cozy café
      cuisineKey: "Cuisine.cafe",
      priceRange: "$",
      addressKey: "CityExplorePage.Saarbruecken.Gastronomy.gastro2.address",
      allowsReservations: false,
      link: "/explore/saarbruecken/cafe/kostbar",
    },
    {
      id: "sb-gastro-3",
      nameKey: "CityExplorePage.Saarbruecken.Gastronomy.gastro3.name",
      descriptionKey:
        "CityExplorePage.Saarbruecken.Gastronomy.gastro3.description",
      imageUrl:
        "https://images.unsplash.com/photo-1502819126416-d387f86d47a1?q=80&w=2036&auto=format&fit=crop", // Trendy bar
      cuisineKey: "Cuisine.bar",
      priceRange: "$$",
      addressKey: "CityExplorePage.Saarbruecken.Gastronomy.gastro3.address",
      allowsReservations: true,
      link: "/explore/saarbruecken/bar/garage",
    },
    {
      id: "sb-gastro-4",
      nameKey: "CityExplorePage.Saarbruecken.Gastronomy.gastro4.name",
      descriptionKey:
        "CityExplorePage.Saarbruecken.Gastronomy.gastro4.description",
      imageUrl:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070&auto=format&fit=crop", // Italian restaurant
      cuisineKey: "Cuisine.italian",
      priceRange: "$$",
      addressKey: "CityExplorePage.Saarbruecken.Gastronomy.gastro4.address",
      allowsReservations: true,
      link: "/explore/saarbruecken/restaurant/bellini",
    },
  ],
};

const ALL_CITY_EXPLORE_DATA: Record<string, CityExploreData> = {
  saarbruecken: SAARBRUECKEN_EXPLORE_DATA,
  // metz: METZ_EXPLORE_DATA, // Add other cities here later
  // trier: TRIER_EXPLORE_DATA,
  // luxembourg: LUXEMBOURG_EXPLORE_DATA,
};

/**
 * Simulates fetching explore data for a specific city.
 * In a real application, this would involve an API call.
 *
 * @param {string} citySlug - The slug of the city (e.g., "saarbruecken").
 * @param {string} locale - The current locale (unused in this mock, but good for future API).
 * @returns {Promise<CityExploreData | null>} A promise that resolves to the city's explore data or null if not found.
 */
export async function getCityExploreData(
  citySlug: string,
  locale: string
): Promise<CityExploreData | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  console.log(`Fetching data for ${citySlug} with locale ${locale}`); // For debugging

  const data = ALL_CITY_EXPLORE_DATA[citySlug.toLowerCase()];
  if (data) {
    return data;
  }
  return null;
}
