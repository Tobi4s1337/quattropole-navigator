"/use client";

import type { ReactElement } from 'react';
import { useTranslations } from "next-intl";
// import Link from "next/link"; // Uncomment if you add links like imprint/privacy

/**
 * @file SiteFooter.tsx
 * @description Footer component for the QuattroPole Navigator application.
 * Displays copyright information and potentially other relevant links.
 */

/**
 * Props for the SiteFooter component.
 * @interface SiteFooterProps
 */
interface SiteFooterProps {
  // Props can be added here if the footer needs to be configurable in the future
}

/**
 * Renders the site footer.
 * Currently, it displays a copyright notice. It can be extended to include other
 * links such as imprint, privacy policy, or social media.
 *
 * @param {SiteFooterProps} _props - The props for the component (currently unused).
 * @returns {ReactElement} The rendered footer element.
 * @example
 * <SiteFooter />
 */
export default function SiteFooter(_props: SiteFooterProps): ReactElement {
  const t = useTranslations("Footer"); // Namespace for footer-specific translations

  return (
    <footer className="border-t bg-muted/20 py-6 backdrop-blur-sm supports-[backdrop-filter]:bg-muted/10">
      <div className="container mx-auto flex flex-col items-center gap-2 px-4 text-center text-xs text-muted-foreground sm:flex-row sm:justify-between md:px-6">
        <p>
          {t("copyright", {
            year: new Date().getFullYear(),
            siteName: "QuattroPole Navigator",
          })}
        </p>
        {/* 
        <nav className="flex gap-4 sm:gap-6">
          <Link
            href="/imprint" // Example link
            className="hover:text-primary hover:underline underline-offset-4 transition-colors duration-200"
          >
            {t("imprintLink")}
          </Link>
          <Link
            href="/privacy-policy" // Example link
            className="hover:text-primary hover:underline underline-offset-4 transition-colors duration-200"
          >
            {t("privacyLink")}
          </Link>
        </nav>
        */}
      </div>
    </footer>
  );
} 