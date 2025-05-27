"/use client";

import type { ReactElement } from 'react';
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { ModeToggle } from "@/components/ModeToggle";

/**
 * @file AppHeader.tsx
 * @description Header component for the QuattroPole Navigator application.
 * Displays the site title/logo and navigation controls like language switcher and theme toggle.
 */

/**
 * Props for the AppHeader component.
 * @interface AppHeaderProps
 */
interface AppHeaderProps {
  // Future props can be added here if needed, e.g., to customize navigation links
}

/**
 * Renders the main application header.
 * It includes the site title, which acts as a link to the homepage,
 * and provides user controls for language selection and theme toggling.
 *
 * @param {AppHeaderProps} _props - The props for the component (currently unused).
 * @returns {ReactElement} The rendered header element.
 * @example
 * <AppHeader />
 */
export default function AppHeader(_props: AppHeaderProps): ReactElement {
  const t = useTranslations("Header"); // Namespace for header-specific translations

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
      <Link href="/" className="flex items-center justify-center gap-2" aria-label={t("siteTitle")}>
        <Image 
          src="/quattropole_navigator_logo.jpg" 
          alt={t("siteTitle")} 
          width={28} 
          height={28} 
          className="h-7 w-7 text-primary"
          priority
        />
        <span className="text-xl font-bold tracking-tight text-foreground">
          {t("siteTitle")}
        </span>
      </Link>
      <nav className="flex items-center gap-2 sm:gap-4">
        <LanguageSwitcher />
        <ModeToggle />
      </nav>
      </div>
    </header>
  );
} 