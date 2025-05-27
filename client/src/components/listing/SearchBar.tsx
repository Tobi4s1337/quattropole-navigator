"use client";

import type { ChangeEvent, FormEvent, ReactElement } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

/**
 * @file SearchBar.tsx
 * @description Component for a search bar input field.
 */

/**
 * Props for the SearchBar component.
 * @interface SearchBarProps
 * @property {string} searchTerm - The current search term.
 * @property {(term: string) => void} onSearchTermChange - Callback when the search term changes.
 * @property {() => void} onSearchSubmit - Callback when the search is submitted.
 * @property {string} placeholderKey - Translation key for the search input placeholder.
 */
interface SearchBarProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onSearchSubmit: () => void;
  placeholderKey: string;
}

/**
 * Renders a search bar with an input field and a search button.
 *
 * @param {SearchBarProps} props - The props for the component.
 * @returns {ReactElement} The rendered search bar.
 * @example
 * <SearchBar
 *   searchTerm={currentSearch}
 *   onSearchTermChange={setSearch}
 *   onSearchSubmit={handleSearch}
 *   placeholderKey="ShoppingListingPage.searchPlaceholder"
 * />
 */
export default function SearchBar({
  searchTerm,
  onSearchTermChange,
  onSearchSubmit,
  placeholderKey,
}: SearchBarProps): ReactElement {
  const t = useTranslations();

  /**
   * Handles the change event of the search input.
   * @param {ChangeEvent<HTMLInputElement>} event - The input change event.
   */
  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onSearchTermChange(event.target.value);
  };

  /**
   * Handles the form submission.
   * @param {FormEvent<HTMLFormElement>} event - The form submission event.
   */
  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    onSearchSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
      <Input
        type="search"
        placeholder={t(placeholderKey)}
        value={searchTerm}
        onChange={handleChange}
        className="flex-grow"
        aria-label={t(placeholderKey)}
      />
      <Button type="submit" aria-label={t("CityExplorePage.HeroSection.searchButton")}>
        <Search className="h-4 w-4 mr-2" />
        {t("CityExplorePage.HeroSection.searchButton")}
      </Button>
    </form>
  );
} 