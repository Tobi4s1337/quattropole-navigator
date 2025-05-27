"use client";

import type { ReactElement } from "react";
import type { ShoppingItemType } from "@/types/explore"; // Will generalize this later
import ShopCard from "./ShopCard"; // Will generalize this later
import { useTranslations } from "next-intl";

/**
 * @file ListView.tsx
 * @description Component to display items in a list or grid view.
 */

/**
 * Props for the ListView component.
 * @interface ListViewProps
 * @property {ShoppingItemType[]} items - Array of items to display.
 * @property {string} [noResultsMessageKey] - Optional translation key for the message when no items are found.
 */
interface ListViewProps {
  items: ShoppingItemType[]; // TODO: Generalize to accept EventType[], SightseeingSpotType[], etc.
  noResultsMessageKey?: string;
}

/**
 * Renders a list/grid of items (e.g., ShopCards).
 *
 * @param {ListViewProps} props - The props for the component.
 * @returns {ReactElement} The rendered list view.
 */
export default function ListView({ items, noResultsMessageKey = "ShoppingListingPage.noResults" }: ListViewProps): ReactElement {
  const t = useTranslations();

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
        <p className="text-lg text-muted-foreground">{t(noResultsMessageKey)}</p>
        {/* You could add an illustration or a suggestion here */}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        // TODO: Conditionally render different card types based on item type
        <ShopCard key={item.id} shop={item} />
      ))}
    </div>
  );
} 