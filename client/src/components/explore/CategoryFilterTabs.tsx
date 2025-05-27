"use client";

import type { ReactElement } from 'react';
import { useTranslations } from 'next-intl';
import type { CategoryFilter, SearchCategory } from '@/types/explore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * @file CategoryFilterTabs.tsx
 * @description Displays filter options as buttons for a given search category.
 */

/**
 * Props for the CategoryFilterTabs component.
 * @interface CategoryFilterTabsProps
 * @property {SearchCategory} selectedCategory - The currently active main search category.
 * @property {CategoryFilter[]} filters - An array of filter options for the selected category.
 * @property {(filterId: string | null) => void} onFilterChange - Callback when a filter is selected or deselected.
 * @property {string | null} activeFilterId - The ID of the currently active filter.
 */
interface CategoryFilterTabsProps {
  selectedCategory: SearchCategory;
  filters: CategoryFilter[];
  onFilterChange: (filterId: string | null) => void;
  activeFilterId: string | null;
}

/**
 * Renders a list of filter buttons for a specific search category.
 * Allows users to refine their search based on sub-categories.
 * The buttons are styled to appear like tabs or chips below the main search bar.
 *
 * @param {CategoryFilterTabsProps} props - The props for the component.
 * @returns {ReactElement | null} The rendered filter tabs, or null if no filters are available.
 */
export default function CategoryFilterTabs({ 
  filters,
  onFilterChange,
  activeFilterId 
}: CategoryFilterTabsProps): ReactElement | null {
  const t = useTranslations('Filters'); // Using a general namespace for filter translations
  const tCategories = useTranslations('SearchCategories');

  if (!filters || filters.length === 0) {
    return null; // Don't render if there are no filters for the category
  }

  return (
    <div className="flex flex-wrap justify-center gap-2 items-center p-2 bg-background/10 dark:bg-slate-900/60 backdrop-blur-sm rounded-md">
      {filters.map((filter) => (
        <Button
          key={filter.id}
          variant="ghost"
          size="sm"
          onClick={() => onFilterChange(activeFilterId === filter.id ? null : filter.id)} // Toggle behavior
          className={cn(
            "transition-all duration-200 ease-in-out",
            activeFilterId === filter.id 
              ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground shadow-md scale-105"
              : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 dark:text-white dark:hover:text-white dark:border-white/30 dark:hover:border-white/60 dark:hover:bg-white/10 border border-primary-foreground/20 hover:border-primary-foreground/40"
          )}
        >
          {t(filter.translationKey.substring(filter.translationKey.indexOf('.') + 1))}
        </Button>
      ))}
    </div>
  );
} 