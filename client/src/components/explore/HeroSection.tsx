"use client";

import type { ReactElement } from 'react';
import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Search, ChevronDown, ShoppingBag, Utensils, CalendarDays, LandPlot, Sparkles, ListFilter, SlidersHorizontal, Accessibility } from 'lucide-react';

import type { CityExploreData } from '@/types/explore';
import { SearchCategory } from '@/types/explore';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CategoryFilterTabs from './CategoryFilterTabs';
// import type { SwitchProps } from '@radix-ui/react-switch'; // TODO: Install if using @radix-ui/react-switch

/**
 * @file HeroSection.tsx
 * @description Hero section for the city explore page, featuring a background image,
 * city name, and a prominent search bar with category selection.
 */

/**
 * Props for the HeroSection component.
 * @interface HeroSectionProps
 * @property {CityExploreData} cityData - The data for the city being explored.
 */
interface HeroSectionProps {
  cityData: CityExploreData;
}

// Define accessibility needs keys for translation and state management
const ACCESSIBILITY_NEEDS_OPTIONS = [
  "wheelchairAccessible",
  "brailleSupport",
  "assistanceDogFriendly",
] as const;

type AccessibilityNeed = typeof ACCESSIBILITY_NEEDS_OPTIONS[number];

// Helper component for the dropdown content to avoid repetition
const AccessibilityDropdownContent = ({
  selectedNeeds,
  onCheckedChange,
  tAccessibility,
  t,
}: {
  selectedNeeds: AccessibilityNeed[];
  onCheckedChange: (need: AccessibilityNeed, checked: boolean) => void;
  tAccessibility: ReturnType<typeof useTranslations<'AccessibilityNeeds'>>;
  t: ReturnType<typeof useTranslations<'CityExplorePage.HeroSection'>>;
}) => (
  <DropdownMenuContent className="w-64 bg-background border-border shadow-xl" align="end">
    <DropdownMenuLabel className="px-2 py-1.5 text-sm font-semibold text-foreground">{t('accessibilityMode.dropdownTitle')}</DropdownMenuLabel>
    <DropdownMenuSeparator className="bg-border/50" />
    {ACCESSIBILITY_NEEDS_OPTIONS.map((need) => (
      <DropdownMenuCheckboxItem
        key={need}
        checked={selectedNeeds.includes(need)}
        onCheckedChange={(checked: boolean) => onCheckedChange(need, checked)}
        className="text-sm py-1.5 hover:bg-muted/50 focus:bg-muted/80 cursor-pointer text-foreground"
      >
        {tAccessibility(need)}
      </DropdownMenuCheckboxItem>
    ))}
  </DropdownMenuContent>
);

const categoryIcons: Record<SearchCategory, ReactElement> = {
  [SearchCategory.Shopping]: <ShoppingBag className="mr-2 h-5 w-5" />,
  [SearchCategory.Gastronomy]: <Utensils className="mr-2 h-5 w-5" />,
  [SearchCategory.Events]: <CalendarDays className="mr-2 h-5 w-5" />,
  [SearchCategory.Sightseeing]: <LandPlot className="mr-2 h-5 w-5" />,
};

/**
 * Renders the hero section for a city exploration page.
 * It includes a full-bleed background image, the city name, and a search interface
 * allowing users to select a category and enter a search query.
 *
 * @param {HeroSectionProps} props - The props for the component.
 * @returns {ReactElement} The rendered hero section.
 */
export default function HeroSection({ cityData }: HeroSectionProps): ReactElement {
  const t = useTranslations('CityExplorePage.HeroSection');
  const tCategories = useTranslations('SearchCategories');
  const tCity = useTranslations('Cities');
  const tAccessibility = useTranslations('AccessibilityNeeds');

  const [searchMode, setSearchMode] = useState<'category' | 'ai'>('category');
  const [aiPrompt, setAiPrompt] = useState<string>('');

  const [selectedCategory, setSelectedCategory] = useState<SearchCategory | undefined>(
    cityData.availableSearchCategories.length > 0 ? cityData.availableSearchCategories[0] : undefined
  );
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeSubFilterId, setActiveSubFilterId] = useState<string | null>(null);

  // State for Accessibility Features
  const [selectedAccessibilityNeeds, setSelectedAccessibilityNeeds] = useState<AccessibilityNeed[]>([]);

  const handleSearch = () => {
    // Implement search logic or redirection based on selectedCategory and searchTerm
    console.log(
      'Searching for:', searchTerm, 
      'in category:', selectedCategory, 
      'with filter:', activeSubFilterId,
      'Selected Accessibility Needs:', selectedAccessibilityNeeds
    );
    // This would typically navigate to a search results page or filter content on the current page.
  };

  // Update active sub-filter when main category changes
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value as SearchCategory);
    setActiveSubFilterId(null); // Reset sub-filter when main category changes
  }

  const handleAiPlannerSubmit = () => {
    console.log(
      'AI Trip Plan Prompt:', aiPrompt,
      'Selected Accessibility Needs:', selectedAccessibilityNeeds
      );
    // Implement AI trip planning logic here
    const baseUrl = 'https://quattropole.saartech.io/ai';
    const queryParams = new URLSearchParams({
      prompt: aiPrompt,
      // You can add accessibility needs to the query if the target page supports them
      // accessibility: selectedAccessibilityNeeds.join(','), 
    });
    const url = `${baseUrl}?${queryParams.toString()}`;
    window.open(url, '_blank');
  };

  const handleAccessibilityNeedChange = (need: AccessibilityNeed, checked: boolean) => {
    setSelectedAccessibilityNeeds((prev) =>
      checked ? [...prev, need] : prev.filter((item) => item !== need)
    );
  };

  return (
    <section 
      id="hero-section"
      className="relative flex h-[calc(100dvh-4rem)] min-h-[500px] md:min-h-[700px] w-full flex-col items-center justify-center text-center text-white overflow-hidden dark:text-white"
    >
      {/* Background Video with Poster Image */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          disablePictureInPicture
          poster="/background-sb-poster.jpg"
          className="object-cover h-full w-full"
          aria-label={t('videoBackgroundAlt', { cityName: tCity(cityData.cityNameKey) })}
        >
          <source src="/background-sb.mp4" type="video/mp4" />
          <p>{t('videoNotSupported')}</p>
          {/* Fallback to image if video fails */}
          <Image
            src={cityData.heroBackgroundImageUrl}
            alt={t('backgroundImageAlt', { cityName: tCity(cityData.cityNameKey) })}
            fill
            className="object-cover"
            priority
          />
        </video>
      </div>
      
      {/* Dark overlay with subtle transparency */}
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />

      {/* Content container with explicit z-index to stay on top */}
      <div className="container relative z-10 px-4 md:px-6 flex flex-col items-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl drop-shadow-md mb-6 text-white">
          {t('title', { cityName: tCity(cityData.cityNameKey) })}
        </h1>
        <p className="max-w-[700px] text-lg text-white/90 md:text-xl drop-shadow-sm mb-10">
          {t('subtitle')}
        </p>

        {/* Search Mode Toggle */}
        <div className="mb-8 flex justify-center items-center p-1 bg-background/15 dark:bg-slate-900/50 backdrop-blur-sm rounded-lg shadow-lg">
          <Button
            variant={searchMode === 'category' ? "default" : "ghost"}
            className={cn(
              "px-6 py-3 text-base font-medium rounded-md transition-all duration-200 ease-in-out w-1/2 cursor-pointer",
              searchMode === 'category' 
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-white hover:text-white hover:bg-white/10"
            )}
            onClick={() => setSearchMode('category')}
          >
            <ListFilter className="mr-2 h-5 w-5" />
            {t('searchModeToggle.categorySearch')}
          </Button>
          <Button
            variant={searchMode === 'ai' ? "default" : "ghost"}
            className={cn(
              "px-6 py-3 text-base font-medium rounded-md transition-all duration-200 ease-in-out w-1/2 cursor-pointer",
              searchMode === 'ai' 
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-white hover:text-white hover:bg-white/10"
            )}
            onClick={() => setSearchMode('ai')}
          >
            <Sparkles className="mr-2 h-5 w-5" />
            {t('searchModeToggle.aiPlanner')}
          </Button>
        </div>

        {/* Search Bar Area / AI Prompt Area */}
        <div className="w-full max-w-2xl">
          {searchMode === 'category' && (
            <>
              <div className="flex flex-col gap-3 mb-6">
                {/* Main search inputs with integrated accessibility toggle */}
                <div className="flex flex-col sm:flex-row gap-3 p-3 bg-background/10 dark:bg-slate-900/50 backdrop-blur-sm rounded-lg shadow-xl">
                  <div className="flex-grow flex flex-col sm:flex-row gap-3">
                    <Select 
                      onValueChange={(value: string) => handleCategoryChange(value as SearchCategory)}
                      defaultValue={selectedCategory}
                    >
                      <SelectTrigger className={cn(
                        "w-full sm:w-[180px] text-foreground dark:text-white bg-background/80 dark:bg-slate-800/80 hover:bg-background/90 dark:hover:bg-slate-800/90 focus:ring-primary border-none text-base flex items-center px-3 py-0",
                        "category-select-trigger-override" // Custom class for CSS override
                      )}>
                        <SelectValue placeholder={t('selectCategoryPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent className="bg-background dark:bg-slate-800 border-border">
                        {cityData.availableSearchCategories.map((category) => (
                          <SelectItem key={category} value={category} className="text-base py-2 hover:bg-muted/50 focus:bg-muted/80 cursor-pointer dark:text-white">
                            <div className="flex items-center">
                              {categoryIcons[category]}
                              {tCategories(category)}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <div className="relative flex-grow">
                      <Input
                        type="search"
                        placeholder={t('searchPlaceholder')}
                        className="h-12 pl-10 text-base bg-background/80 dark:bg-slate-800/80 hover:bg-background/90 dark:hover:bg-slate-800/90 focus-visible:ring-primary border-none text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      />
                      <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground dark:text-slate-400" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-auto sm:ml-0">
                    <Button type="button" size="lg" className="h-12 text-base px-6 sm:px-8 bg-primary hover:bg-primary/90" onClick={handleSearch}>
                      {t('searchButton')}
                    </Button>
                    
                    {/* Accessibility Dropdown Menu */}
                    <div className="flex items-center ml-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className={cn(
                              "relative w-10 h-10 rounded-md bg-background/80 dark:bg-slate-800/80 hover:bg-background/90 dark:hover:bg-slate-800/90 border border-border/60 hover:border-border text-foreground dark:text-white flex items-center justify-center cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 transition-all duration-150",
                              selectedAccessibilityNeeds.length > 0 && "bg-primary/10 dark:bg-primary/20 border-primary text-primary dark:text-primary-foreground"
                            )}
                            title={t('accessibilityMode.toggleLabel')}
                          >
                            <Accessibility className="h-5 w-5" />
                            {selectedAccessibilityNeeds.length > 0 && (
                              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground ring-1 ring-background/80 dark:ring-slate-900/80">
                                {selectedAccessibilityNeeds.length}
                              </span>
                            )}
                          </button>
                        </DropdownMenuTrigger>
                        <AccessibilityDropdownContent
                          selectedNeeds={selectedAccessibilityNeeds}
                          onCheckedChange={handleAccessibilityNeedChange}
                          tAccessibility={tAccessibility}
                          t={t}
                        />
                      </DropdownMenu>
                    </div>
                  </div>
                </div>

                {/* Conditional Category Filters */}
                {selectedCategory && (
                  <div className='mt-2 w-full'>
                    <CategoryFilterTabs 
                      selectedCategory={selectedCategory} 
                      filters={cityData.searchCategoryFilters[selectedCategory] || []} 
                      activeFilterId={activeSubFilterId}
                      onFilterChange={(filterId) => {
                        setActiveSubFilterId(filterId);
                        console.log('Filter changed to:', filterId);
                      }}
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {searchMode === 'ai' && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-3 p-3 bg-background/10 dark:bg-slate-900/50 backdrop-blur-sm rounded-lg shadow-xl">
                {/* AI Prompt header row with integrated accessibility toggle */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Sparkles className="h-6 w-6 mr-2.5 text-white" />
                    <span className="text-lg font-semibold text-white">{t('aiPlanner.sectionTitle')}</span>
                  </div>
                  
                  {/* Accessibility Dropdown Menu for AI planner */}
                  <div className="flex items-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            "relative w-10 h-10 rounded-md bg-background/80 dark:bg-slate-800/80 hover:bg-background/90 dark:hover:bg-slate-800/90 border border-border/60 hover:border-border text-foreground dark:text-white flex items-center justify-center cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 transition-all duration-150",
                            selectedAccessibilityNeeds.length > 0 && "bg-primary/10 dark:bg-primary/20 border-primary text-primary dark:text-primary-foreground"
                          )}
                          title={t('accessibilityMode.toggleLabel')}
                        >
                          <Accessibility className="h-5 w-5" />
                          {selectedAccessibilityNeeds.length > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground ring-1 ring-background/80 dark:ring-slate-900/80">
                              {selectedAccessibilityNeeds.length}
                            </span>
                          )}
                        </button>
                      </DropdownMenuTrigger>
                      <AccessibilityDropdownContent
                        selectedNeeds={selectedAccessibilityNeeds}
                        onCheckedChange={handleAccessibilityNeedChange}
                        tAccessibility={tAccessibility}
                        t={t}
                      />
                    </DropdownMenu>
                  </div>
                </div>

                {/* AI prompt input */}
                <Input
                  type="text"
                  placeholder={t('aiPlanner.promptPlaceholder')}
                  className="h-12 pl-4 text-base bg-background/80 dark:bg-slate-800/80 hover:bg-background/90 dark:hover:bg-slate-800/90 focus-visible:ring-primary border-none text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAiPlannerSubmit()}
                />

                {/* Generate button */}
                <Button type="button" size="lg" className="h-12 text-base px-8 bg-primary hover:bg-primary/90" onClick={handleAiPlannerSubmit}>
                  <Sparkles className="mr-2 h-5 w-5" />
                  {t('aiPlanner.generateButton')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
} 