"use client";

import type { ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { ShoppingItemType } from "@/types/explore"; // Will generalize later
import { Button } from "@/components/ui/button";
import { MapPin, Clock, ExternalLink, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * @file MapPopupCard.tsx
 * @description Component to display item details within a map popup.
 */

/**
 * Props for the MapPopupCard component.
 * @interface MapPopupCardProps
 * @property {ShoppingItemType} item - The item data to display.
 */
interface MapPopupCardProps {
  item: ShoppingItemType; // Generalize later to support EventType, SightseeingSpotType etc.
}

/**
 * Renders a compact card for map popups, displaying item information.
 *
 * @param {MapPopupCardProps} props - The props for the component.
 * @returns {ReactElement} The rendered map popup card.
 */
export default function MapPopupCard({ item }: MapPopupCardProps): ReactElement {
  const t = useTranslations();
  const tFilters = useTranslations("Filters");

  const itemName = t(item.nameKey);
  const itemAddress = t(item.addressKey);

  // Determine if there's a specific detail page link
  // This logic might need adjustment based on how detail page links are structured for different item types
  const detailLink = item.link?.startsWith("/explore") ? item.link : null;
  const externalLink = item.link && !item.link.startsWith("/explore") ? item.link : null;

  return (
    <div className="w-64 p-3 bg-background shadow-xl rounded-lg">
      {item.imageUrl && (
        <div className="relative h-32 w-full mb-2 rounded-md overflow-hidden">
          <Image
            src={item.imageUrl}
            alt={itemName}
            fill
            className="object-cover"
          />
        </div>
      )}
      <h3 className="text-md font-semibold mb-1 truncate" title={itemName}>
        {itemName}
      </h3>
      <div className="text-xs text-muted-foreground space-y-1 mb-2">
        {itemAddress && (
          <div className="flex items-start">
            <MapPin className="h-3 w-3 mr-1.5 mt-0.5 shrink-0" />
            <span className="truncate" title={itemAddress}>{itemAddress}</span>
          </div>
        )}
        {/* Minimal version, can add more details like opening hours or type later if space allows */}
         {item.openingHoursKey && (
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1.5 shrink-0" />
            <span className="truncate" title={t(item.openingHoursKey)}>{t(item.openingHoursKey)}</span>
          </div>
        )}
      </div>

      {item.typeKeys && item.typeKeys.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {item.typeKeys.slice(0, 2).map((typeKey) => ( // Show max 2 badges to save space
            <Badge key={typeKey} variant="secondary" className="text-xs px-1.5 py-0.5">
              {tFilters(typeKey.startsWith("Filters.") ? typeKey : `Filters.Shopping.${typeKey}`)}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex space-x-2">
        {detailLink && (
          <Button asChild size="sm" variant="outline" className="flex-1 text-xs h-7">
            <Link href={detailLink}>
              <Info className="mr-1 h-3 w-3" /> {t("Common.viewDetails")}
            </Link>
          </Button>
        )}
        {externalLink && (
           <Button asChild size="sm" variant="secondary" className="flex-1 text-xs h-7">
            <Link href={externalLink} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1 h-3 w-3" /> {t("General.viewDetails")} {/* Assuming General.viewDetails is for external */}
            </Link>
          </Button>
        )}
      </div>
       {/* If no links at all, maybe show a placeholder or nothing */}
       {!detailLink && !externalLink && item.link && (
        <Button size="sm" variant="outline" className="w-full text-xs h-7" disabled>
            {t("Common.viewDetails")}
        </Button>
       )}
    </div>
  );
} 