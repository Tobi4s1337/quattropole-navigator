"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Github, Copy, Check, Star, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactElement } from 'react';

import { ModeToggle } from "../ModeToggle";

import { useTranslations } from "next-intl";
import OmitRTL from "../OmmitRlt";
import LanguageSwitcher from "../LanguageSwitcher";

import AppHeader from "@/components/layout/AppHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import CitySelection from "@/components/cities/CitySelection";
import type { City } from "@/types/entities";

function CopyableCode({ children }: { children: string }) {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(children).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1000);
    });
  };

  return (
    <div className="relative">
      <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded overflow-x-auto hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200">
        <code>{children}</code>
      </pre>
      <Button
        variant="outline"
        size="icon"
        className="absolute top-2 right-2"
        onClick={copyToClipboard}
      >
        <p className="sr-only">Cope code button</p>
        {isCopied ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

/**
 * @file HomeIndex.tsx
 * @description The main landing page for QuattroPole Navigator.
 * It features a dedicated header, a city selection grid as the main content,
 * and a site footer. This page provides a focused experience for users to select a city to explore.
 */

/**
 * Static data for the cities to be displayed on the landing page.
 * Each object conforms to the City interface and includes all necessary details for rendering a CityCard.
 * TODO: This data could eventually be fetched from an API or a more centralized data store.
 * 
 * @const {City[]} CITIES_DATA
 * @property {string} id - Unique ID for the city.
 * @property {string} nameKey - Translation key for the city's name (e.g., "Cities.luxembourg").
 * @property {string} descriptionKey - Translation key for the city's description.
 * @property {string} color - Tailwind CSS class for light theme background (e.g., "bg-[#FFEEB6]").
 * @property {string} darkColor - Tailwind CSS class for dark theme background (e.g., "dark:bg-yellow-900").
 * @property {string} imageUrl - URL for the city's representative image (Unsplash placeholders).
 * @property {string} href - Navigation path for the city's page (e.g., "/explore/luxembourg").
 */
const CITIES_DATA: City[] = [
  {
    id: "luxembourg",
    nameKey: "Cities.luxembourg",
    descriptionKey: "Cities.luxembourgDescription",
    color: "bg-[#FFEEB6]",
    darkColor: "dark:bg-yellow-900/80", 
    imageUrl: "https://images.unsplash.com/photo-1588336899284-950764f07147?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    href: "/explore/luxembourg",
  },
  {
    id: "trier",
    nameKey: "Cities.trier",
    descriptionKey: "Cities.trierDescription",
    color: "bg-[#EAEAEA]",
    darkColor: "dark:bg-neutral-700/80",
    imageUrl: "https://images.unsplash.com/photo-1728306173203-4ef0151f4071?q=80&w=1548&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    href: "/explore/trier",
  },
  {
    id: "metz",
    nameKey: "Cities.metz",
    descriptionKey: "Cities.metzDescription",
    color: "bg-[#BECFBD]",
    darkColor: "dark:bg-green-900/80",
    imageUrl: "https://images.unsplash.com/photo-1671826503007-fd5874c3fa5d?q=80&w=1746&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    href: "/explore/metz",
  },
  {
    id: "saarbruecken",
    nameKey: "Cities.saarbruecken",
    descriptionKey: "Cities.saarbrueckenDescription",
    color: "bg-[#C2C8E1]",
    darkColor: "dark:bg-indigo-800/80",
    imageUrl: "https://images.unsplash.com/photo-1589099504341-424c8629247c",
    href: "/explore/saarbruecken",
  },
];

/**
 * Renders the main home page for the QuattroPole Navigator.
 * This component orchestrates the display of the application header,
 * a welcome message, the city selection interface, and the site footer.
 * It's designed to fill the viewport height and provide a seamless user experience.
 *
 * @returns {ReactElement} The rendered home page.
 */
export default function HomeIndex(): ReactElement {
  const t = useTranslations("IndexPage"); 

  return (
    <div className="flex min-h-dvh w-full flex-col bg-background text-foreground">
      <AppHeader />
      <main className="flex flex-1 flex-col w-full relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-24 -right-16 h-[300px] w-[300px] rounded-full bg-primary/5 blur-3xl" aria-hidden="true" />
          <div className="absolute bottom-24 -left-16 h-[250px] w-[250px] rounded-full bg-secondary/5 blur-3xl" aria-hidden="true" />
        </div>
        
        {/* Centered content container for both sections */}
        <div className="container mx-auto px-4 md:px-6 py-16 md:py-24 flex flex-col items-center">
          <div className="w-full max-w-5xl">
            {/* Welcome Message Section - aligned with card grid */}
            <section className="mb-12 md:mb-16">
              <div className="inline-block rounded-lg bg-muted/60 px-3 py-1 text-sm mb-4">
                <MapPin className="inline-block mr-1 h-4 w-4" />
                <span>{t("discoverAndExplore")}</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tighter text-foreground sm:text-4xl md:text-5xl mb-4">
                {t("welcomeTitle")}
              </h1>
              <p className="text-muted-foreground md:text-xl max-w-[920px]">
                {t("welcomeSubtitle")}
              </p>
            </section>
            
            {/* City Grid Section - same container as welcome for alignment */}
            <CitySelection cities={CITIES_DATA} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
