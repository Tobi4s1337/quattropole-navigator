"use client";

import type { ReactElement } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ShoppingBagIcon, CalendarDays, Landmark, Sparkles as AiIcon, Menu, X, Utensils, ChevronDown, Map, Globe } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet'; // For mobile menu
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react'; // Added for scroll progress
import { ModeToggle } from '@/components/ModeToggle'; // Added
import LanguageSwitcher from '@/components/LanguageSwitcher'; // Added
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * @file IslandNavbar.tsx
 * @description A responsive, island-style navigation bar for the city explore pages.
 * Features a logo, navigation links, a CTA, and a back button.
 * It uses a sheet for the mobile menu.
 */

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void; // For closing sheet on click
}

/**
 * Represents a city in the QuattroPole region
 * @interface CityOption
 * @property {string} id - The unique identifier/slug for the city
 * @property {string} nameKey - The translation key for the city's name
 */
interface CityOption {
  id: string;
  nameKey: string;
}

// Define available cities in the QuattroPole region
const CITY_OPTIONS: CityOption[] = [
  { id: 'luxembourg', nameKey: 'luxembourg' },
  { id: 'trier', nameKey: 'trier' },
  { id: 'metz', nameKey: 'metz' },
  { id: 'saarbruecken', nameKey: 'saarbruecken' },
];

/**
 * Renders a navigation link with active state highlighting based on the current hash.
 * @param {NavLinkProps} props - Props for the NavLink.
 * @returns {ReactElement} The rendered navigation link.
 */
function NavLink({ href, children, onClick }: NavLinkProps): ReactElement {
  const pathname = usePathname();
  const isActive = pathname + '#' + (href.split('#')[1] || '') === href; // Basic hash checking

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "text-sm font-medium transition-colors hover:text-primary",
        isActive ? "text-primary" : "text-muted-foreground"
      )}
    >
      {children}
    </Link>
  );
}

/**
 * Props for the IslandNavbar component.
 * @interface IslandNavbarProps
 * @property {string} citySlug - The current city slug to construct correct hash links.
 * @property {string} currentCityName - The translated name of the current city.
 */
interface IslandNavbarProps {
  citySlug: string;
  currentCityName: string;
}

/**
 * Renders the IslandNavbar component.
 * This navbar is designed to float above the content with a backdrop blur effect.
 * It includes navigation to page sections, a CTA, and a back button.
 *
 * @param {IslandNavbarProps} props - The props for the component.
 * @returns {ReactElement} The rendered IslandNavbar.
 */
export default function IslandNavbar({ citySlug, currentCityName }: IslandNavbarProps): ReactElement {
  const t = useTranslations('IslandNavbar');
  const tCity = useTranslations('Cities');
  const currentPathBase = `/explore/${citySlug}`;
  const [scrollProgress, setScrollProgress] = useState(0); // Scroll progress state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => { // Scroll progress effect
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const currentScroll = window.scrollY;
      if (totalScroll > 0) {
        setScrollProgress((currentScroll / totalScroll) * 100);
      } else {
        setScrollProgress(0);
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: `${currentPathBase}#events-section`, label: t('navEvents'), Icon: CalendarDays },
    { href: `${currentPathBase}#attractions-section`, label: t('navAttractions'), Icon: Landmark },
    { href: `${currentPathBase}#shopping-section`, label: t('navShopping'), Icon: ShoppingBagIcon },
    { href: `${currentPathBase}#gastronomy-section`, label: t('navGastronomy'), Icon: Utensils },
  ];

  return (
    <header className="sticky top-4 inset-x-0 z-50 mx-auto max-w-6xl -mt-4 -mb-[42px]">
      <div className="relative flex flex-col items-center">
        {/* Main navbar */}
        <nav 
          className="relative flex items-center justify-between gap-4 rounded-xl bg-background/80 p-2 shadow-lg ring-1 ring-foreground/5 backdrop-blur-md overflow-hidden w-full"
          aria-label={t('exploreSection')}
        >
          {/* Integrated Scroll Progress Bar as top border effect */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary/30">
            <div 
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-150 ease-linear"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>

          {/* Logo / Site Name - now linking to index page */}
          <Link href="/" className="flex items-center justify-center gap-2 pt-1.5" aria-label={t("logoText")}>
            <Image 
              src="/quattropole_navigator_logo.jpg" 
              alt={t("logoText")}
              width={28} 
              height={28} 
              className="h-7 w-7 text-primary"
              priority
            />
            <span className="hidden sm:inline text-xl font-bold tracking-tight text-foreground">
              {t("logoText")}
            </span>
          </Link>

          {/* Mobile City Selector (visible only on mobile) */}
          <div className="md:hidden flex items-center pt-1.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="flex items-center gap-1.5 px-2 py-1 bg-background/90 rounded-lg border border-border/20 hover:bg-background/95 transition-colors" 
                  aria-label={t("cityDropdown.ariaLabel")}
                >
                  <Map className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-medium">{currentCityName}</span>
                  <ChevronDown className="h-3 w-3 text-primary" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="min-w-[180px] p-2 bg-background/95 backdrop-blur-md border border-border/40 shadow-xl rounded-xl"
                align="center"
              >
                <div className="mb-2 px-3 py-1.5">
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    <div className="flex items-center">
                      <Globe className="h-3 w-3 mr-1 text-primary" />
                      {t("cityDropdown.selectCity")}
                    </div>
                  </div>
                </div>
                {CITY_OPTIONS.map(city => (
                  <DropdownMenuItem 
                    key={city.id} 
                    className={cn(
                      "rounded-lg px-3 py-2 cursor-pointer flex items-center gap-2 transition-colors",
                      city.id === citySlug 
                        ? "bg-primary/10 text-primary font-medium hover:bg-primary/15"
                        : "hover:bg-muted focus:bg-muted"
                    )}
                    asChild
                  >
                    <Link href={`/explore/${city.id}`}>
                      {city.id === citySlug && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mr-0.5" />
                      )}
                      {tCity(city.nameKey)}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop Navigation Links - Centered now that back button is gone */}
          <div className="flex-grow hidden md:flex items-center justify-center gap-6 pt-1.5">
            {navItems.map((item) => (
              <NavLink key={item.label} href={item.href}>
                <item.Icon className="mr-1.5 h-4 w-4 inline-block" />
                {item.label}
              </NavLink>
            ))}
          </div>
          
          <div className="hidden sm:flex items-center gap-2 pt-1.5"> {/* Wrapper for CTA and toggles */}
            {/* CTA Button */}
            <Button 
              asChild 
              className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => {
                const heroSection = document.getElementById('hero-section');
                if (heroSection) {
                  heroSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <div> 
                <AiIcon className="mr-2 h-4 w-4" />
                {t('ctaPlanTrip')}
              </div>
            </Button>

            {/* Language Switcher and Mode Toggle */}
            <LanguageSwitcher />
            <ModeToggle />
          </div>

          {/* Mobile Menu Trigger */}
          <div className="md:hidden pt-1.5">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-lg">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-xs bg-background p-6">
                <div className="mb-6 flex items-center justify-between">
                  <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-foreground">
                    <Image 
                      src="/quattropole_navigator_logo.jpg" 
                      alt={t("logoText")}
                      width={24} 
                      height={24} 
                      className="h-6 w-6 text-primary"
                      priority
                    />
                    <span className="text-lg font-bold">{t("logoText")}</span>
                  </Link>
                  <SheetClose asChild>
                     <Button variant="ghost" size="icon" className="rounded-lg">
                      <X className="h-6 w-6" />
                      <span className="sr-only">Close navigation menu</span>
                    </Button>
                  </SheetClose>
                </div>
                
                {/* Current City and City Switcher in mobile menu */}
                <div className="mb-6 p-3 bg-muted/50 rounded-lg">
                  <div className="text-sm font-medium mb-2 flex items-center gap-1.5">
                    <Map className="h-4 w-4 text-primary" />
                    {t("cityDropdown.currentCity")}
                  </div>
                  <div className="text-base font-semibold text-foreground mb-3">
                    {currentCityName}
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    {t("cityDropdown.switchTo")}:
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {CITY_OPTIONS.filter(city => city.id !== citySlug).map(city => (
                      <SheetClose asChild key={city.id}>
                        <Link 
                          href={`/explore/${city.id}`}
                          className="px-3 py-1.5 bg-background hover:bg-background/80 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
                        >
                          {tCity(city.nameKey)}
                        </Link>
                      </SheetClose>
                    ))}
                  </div>
                </div>
                
                <nav className="flex flex-col gap-4">
                  {navItems.map((item) => (
                    <SheetClose asChild key={item.label}>
                      <NavLink href={item.href}>
                        <item.Icon className="mr-2 h-5 w-5 inline-block" />
                        {item.label}
                      </NavLink>
                    </SheetClose>
                  ))}
                  <SheetClose asChild>
                    <Button 
                      className="w-full justify-start mt-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={() => {
                        const heroSection = document.getElementById('hero-section');
                        if (heroSection) {
                          heroSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                    >
                      <AiIcon className="mr-2 h-5 w-5" />
                      {t('ctaPlanTrip')}
                    </Button>
                  </SheetClose>
                  {/* Language Switcher and Mode Toggle in Mobile Menu */}
                  <div className="mt-4 pt-4 border-t border-border/20 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Language</span>
                      <LanguageSwitcher />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Theme</span>
                      <ModeToggle />
                    </div>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </nav>

        {/* City Selector Tab - Desktop only */}
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <button 
              className={cn(
                "absolute -bottom-8 bg-background/80 backdrop-blur-md shadow-lg px-4 py-1 rounded-b-2xl",
                "border-l border-r border-b border-foreground/5",
                "flex items-center gap-2 transition-all duration-300",
                "hover:bg-background/90 hover:py-2 group",
                isDropdownOpen ? "bg-background/90 py-2" : "",
                "hidden md:flex" // Hide on mobile, display on md screens and up
              )} 
              aria-label={t("cityDropdown.ariaLabel")}
            >
              <Map className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">{currentCityName}</span>
              <ChevronDown className={cn(
                "h-4 w-4 text-primary transition-transform duration-300",
                isDropdownOpen ? "transform rotate-180" : "",
                "group-hover:animate-pulse"
              )} />
              
              {/* Decorative elements */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-1/2 h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                <div className="absolute bottom-0 left-1/4 w-1/2 h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
              </div>
            </button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent 
            className="min-w-[200px] p-2 bg-background/95 backdrop-blur-md border border-border/40 shadow-xl rounded-xl mt-2"
            align="center"
          >
            <div className="mb-2 px-3 py-1.5">
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                <div className="flex items-center">
                  <Globe className="h-3 w-3 mr-1 text-primary" />
                  {t("cityDropdown.selectCity")}
                </div>
              </div>
            </div>
            {CITY_OPTIONS.map(city => (
              <DropdownMenuItem 
                key={city.id} 
                className={cn(
                  "rounded-lg px-3 py-2 cursor-pointer flex items-center gap-2 transition-colors",
                  city.id === citySlug 
                    ? "bg-primary/10 text-primary font-medium hover:bg-primary/15"
                    : "hover:bg-muted focus:bg-muted"
                )}
                asChild
              >
                <Link href={`/explore/${city.id}`}>
                  {city.id === citySlug && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mr-0.5" />
                  )}
                  {tCity(city.nameKey)}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
} 