"use client";

import { useState, type ReactElement, useMemo, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import type { CityExploreData, FilterGroup, ShoppingItemType } from "@/types/explore";
import { SearchCategory } from "@/types/explore";
import FilterSidebar, { type ActiveFilters } from "./FilterSidebar";
import SearchBar from "./SearchBar";
import ViewModeToggle, { ViewMode } from "./ViewModeToggle";
import ListView from "./ListView";
import MapView from "./MapView";

/**
 * @file ListingPageLayout.tsx
 * @description Reusable layout for listing pages (shops, events, sights, gastronomy).
 */

/**
 * Props for the ListingPageLayout component.
 * @interface ListingPageLayoutProps
 * @property {() => Promise<CityExploreData | null>} fetchDataFn - Function to fetch the city data
 * @property {string} pageTitleKey - Translation key for the main page title (e.g., "ShoppingListingPage.title").
 * @property {string} searchPlaceholderKey - Translation key for the search bar placeholder.
 * @property {SearchCategory} category - The current category being displayed (e.g., SearchCategory.Shopping).
 */
interface ListingPageLayoutProps {
  fetchDataFn: () => Promise<CityExploreData | null>;
  pageTitleKey: string;
  searchPlaceholderKey: string;
  category: SearchCategory;
}

/**
 * Renders a common layout structure for listing pages.
 * It includes a search bar, filter sidebar, view mode toggle, and content area for list or map.
 *
 * @param {ListingPageLayoutProps} props - The props for the component.
 * @returns {ReactElement} The rendered listing page layout.
 */
export default function ListingPageLayout({
  fetchDataFn,
  pageTitleKey,
  searchPlaceholderKey,
  category,
}: ListingPageLayoutProps): ReactElement {
  const t = useTranslations();
  const tCities = useTranslations("Cities");
  
  const [cityData, setCityData] = useState<CityExploreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.List);

  // Fetch data when component mounts
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchDataFn();
        setCityData(data);
      } catch (error) {
        console.error("Error fetching city data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [fetchDataFn]);

  // Prepare items and filters based on the category
  const allItems = useMemo(() => {
    if (!cityData) return [];
    
    switch (category) {
      case SearchCategory.Shopping:
        return cityData.shopping || [];
      case SearchCategory.Gastronomy:
        return cityData.gastronomy || [];
      case SearchCategory.Events:
        return cityData.events || [];
      case SearchCategory.Sightseeing:
        return cityData.sightseeing || [];
      default:
        return [];
    }
  }, [cityData, category]);

  const filterGroups = useMemo(() => {
    if (!cityData || !cityData.listingPageFilters) return [];
    return cityData.listingPageFilters[category] || [];
  }, [cityData, category]);

  const cityName = useMemo(() => {
    if (!cityData) return "";
    return tCities(cityData.cityNameKey);
  }, [cityData, tCities]);

  /**
   * Handles changes to filter selections.
   * @param {string} groupId - The ID of the filter group.
   * @param {string} optionId - The ID of the selected/deselected option.
   * @param {boolean} checked - Whether the option is now checked or unchecked.
   */
  const handleFilterChange = useCallback(
    (groupId: string, optionId: string, checked: boolean) => {
      setActiveFilters((prevFilters) => {
        const newGroupFilters = prevFilters[groupId] ? [...prevFilters[groupId]] : [];
        if (checked) {
          if (!newGroupFilters.includes(optionId)) {
            newGroupFilters.push(optionId);
          }
        } else {
          const index = newGroupFilters.indexOf(optionId);
          if (index > -1) {
            newGroupFilters.splice(index, 1);
          }
        }
        return {
          ...prevFilters,
          [groupId]: newGroupFilters.length > 0 ? newGroupFilters : undefined,
        };
      });
    },
    []
  );

  /**
   * Resets all active filters.
   */
  const handleResetFilters = useCallback(() => {
    setActiveFilters({});
    setSearchTerm(""); // Also reset search term
  }, []);

  /**
   * Filters the items based on the current search term and active filters.
   */
  const filteredItems = useMemo(() => {
    let items = [...allItems];

    // Apply search term filter (simple name search for now)
    if (searchTerm) {
      items = items.filter((item) =>
        t(item.nameKey).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply active filters
    Object.entries(activeFilters).forEach(([groupId, selectedOptions]) => {
      if (!selectedOptions || selectedOptions.length === 0) return;

      // This is a simplified filtering logic. More complex logic might be needed
      // depending on how filter criteria are defined (e.g., AND vs OR within a group).
      // Current assumption: an item must match AT LEAST ONE selected option in a group if that group has active filters.
      // And it must satisfy this for ALL groups that have active filters.
      
      items = items.filter((item) => {
        // Find the corresponding filter group definition to know how to check the item
        const filterGroupDef = filterGroups.find(fg => fg.id === groupId);
        if (!filterGroupDef) return true; // Should not happen if data is consistent

        // Example for shop types (assumes item.typeKeys exists)
        if (groupId === "shopTypes" && item.typeKeys) {
          return selectedOptions.some(optId => item.typeKeys?.map(tk => t(tk).toLowerCase()).includes(t(`Filters.Shopping.${optId}`).toLowerCase()) || item.typeKeys?.includes(optId) ); 
        }
        // Example for opening days (assumes item.openingDays exists)
        if (groupId === "openingDays" && item.openingDays) {
          return selectedOptions.some(optId => item.openingDays?.includes(optId as any)); // any cast for OpeningDays enum
        }
        // Example for district (assumes item.districtKey exists)
        if (groupId === "district" && item.districtKey) {
          return selectedOptions.includes(t(item.districtKey));
        }
        // Add more specific filtering logic for other groupIds and item properties here
        // For now, if no specific logic, we assume it doesn't match if the group is active
        // This part would need to be much more robust for a real application.
        // Consider passing a filtering function map for different categories/groups.

        // Fallback: If a filter group is active but no specific logic is defined for it here,
        // and the item doesn't have a clear property to match against this groupId,
        // it's hard to determine. For now, let's be conservative and assume no match
        // if the specific logic isn't implemented above for an active filter group.
        // A more robust solution would have a mapping of filter group IDs to item properties.
        // console.warn(`No specific filtering logic for groupId: ${groupId}`);
        return true; // Default to true if no specific logic, to not over-filter initially
      });
    });

    return items;
  }, [allItems, searchTerm, activeFilters, t, filterGroups]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 w-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2">
          {t(pageTitleKey, { cityName })}
        </h1>
        {/* Optional: Add a subtitle or breadcrumbs here */}
      </header>

      <div className="mb-6">
        <SearchBar
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          placeholderKey={searchPlaceholderKey}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <FilterSidebar
          filterGroups={filterGroups}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
        />

        <main className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-muted-foreground">
              {t("Filters.Actions.showResults", { count: filteredItems.length })}
            </p>
            <ViewModeToggle currentMode={viewMode} onModeChange={setViewMode} />
          </div>

          {filteredItems.length === 0 ? (
            <div className="flex justify-center items-center min-h-[300px] border border-dashed rounded-lg p-8">
              <p className="text-muted-foreground">{t("ShoppingListingPage.noResults")}</p>
            </div>
          ) : viewMode === ViewMode.List ? (
            <ListView items={filteredItems} />
          ) : (
            <MapView items={filteredItems} />
          )}
        </main>
      </div>
    </div>
  );
} 