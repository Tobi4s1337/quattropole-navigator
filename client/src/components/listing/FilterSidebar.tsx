"use client";

import type { ReactElement } from "react";
import { useTranslations } from "next-intl";
import type { FilterGroup, FilterOption } from "@/types/explore";
import FilterAccordion from "./FilterAccordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

/**
 * @file FilterSidebar.tsx
 * @description Sidebar component for displaying various filters for listings.
 */

/**
 * Type for the active filters state.
 * The keys are filter group IDs, and values are arrays of selected option IDs.
 * @example { "shopTypes": ["fashion", "electronics"], "openingDays": ["monday"] }
 */
export type ActiveFilters = Record<string, string[]>;

/**
 * Props for the FilterSidebar component.
 * @interface FilterSidebarProps
 * @property {FilterGroup[]} filterGroups - An array of filter groups to display.
 * @property {ActiveFilters} activeFilters - The currently active/selected filters.
 * @property {(group: string, optionId: string, checked: boolean) => void} onFilterChange - Callback when a filter option is changed.
 * @property {() => void} onResetFilters - Callback to reset all filters.
 */
interface FilterSidebarProps {
  filterGroups: FilterGroup[];
  activeFilters: ActiveFilters;
  onFilterChange: (groupId: string, optionId: string, checked: boolean) => void;
  onResetFilters: () => void;
}

/**
 * Renders a sidebar with accordion-style filter groups.
 *
 * @param {FilterSidebarProps} props - The props for the component.
 * @returns {ReactElement} The rendered filter sidebar.
 */
export default function FilterSidebar({
  filterGroups,
  activeFilters,
  onFilterChange,
  onResetFilters,
}: FilterSidebarProps): ReactElement {
  const t = useTranslations("Filters");
  const tShoppingPage = useTranslations("ShoppingListingPage");

  return (
    <aside className="w-full md:w-72 lg:w-80 p-1 md:sticky md:top-24 md:self-start md:h-[calc(100vh-6rem)] flex flex-col space-y-6">
      <div className="flex justify-between items-center flex-shrink-0">
        <h2 className="text-xl font-semibold">{tShoppingPage("filtersTitle")}</h2>
        <Button variant="link" onClick={onResetFilters} className="p-0 h-auto text-sm">
          {t("Actions.resetFilters")}
        </Button>
      </div>
      
      {/* This div will manage the scrollable area */}
      <div className="flex flex-col flex-grow min-h-0">
        <ScrollArea className="flex-grow pr-3">
          <div className="space-y-4">
            {filterGroups.map((group) => {
              // Determine which translation namespace to use based on the group ID
              let title;
              
              // Handle the special cases for each filter group type
              if (group.id === "shopTypes") {
                title = tShoppingPage("shopTypesTitle");
              } else if (group.id === "districts") {
                title = tShoppingPage("districtsTitle");
              } else if (group.id === "openingDays") {
                title = t("OpeningDays.title");
              } else if (group.id === "services") {
                title = t("Services.title");
              } else if (group.id === "paymentMethods") {
                title = t("PaymentMethods.title");
              } else if (group.id === "labels") {
                title = t("Labels.title");
              } else {
                // Fallback if none of the specific cases match
                title = group.id;
              }
              
              return (
                <FilterAccordion
                  key={group.id}
                  value={group.id}
                  title={title}
                  defaultValue={group.id}
                >
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {group.options.map((option: FilterOption) => {
                      // Determine the appropriate translation path based on the group and option
                      let optionLabel;
                      
                      // Map option IDs to their correct translation keys
                      if (group.id === "shopTypes") {
                        optionLabel = t(`Shopping.${option.id}`);
                      } else if (group.id === "districts") {
                        optionLabel = t(`Districts.${option.id}`);
                      } else if (group.id === "openingDays") {
                        optionLabel = t(`OpeningDays.${option.id}`);
                      } else if (group.id === "services") {
                        optionLabel = t(`Services.${option.id}`);
                      } else if (group.id === "paymentMethods") {
                        optionLabel = t(`PaymentMethods.${option.id}`);
                      } else if (group.id === "labels") {
                        optionLabel = t(`Labels.${option.id}`);
                      } else {
                        // Fallback if none of the specific cases match
                        optionLabel = option.id;
                      }
                      
                      return (
                        <div key={option.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${group.id}-${option.id}`}
                            checked={activeFilters[group.id]?.includes(option.id) || false}
                            onCheckedChange={(checked) =>
                              onFilterChange(group.id, option.id, Boolean(checked))
                            }
                          />
                          <Label
                            htmlFor={`${group.id}-${option.id}`}
                            className="text-sm font-normal cursor-pointer flex-grow"
                          >
                            {optionLabel}
                          </Label>
                          {typeof option.count === 'number' && (
                            <span className="text-xs text-muted-foreground">
                              {option.count}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </FilterAccordion>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </aside>
  );
} 