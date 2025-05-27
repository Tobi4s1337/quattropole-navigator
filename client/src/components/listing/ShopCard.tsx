"use client";

import type { ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { ShoppingItemType } from "@/types/explore";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * @file ShopCard.tsx
 * @description Component to display a single shop item in a card format.
 */

/**
 * Props for the ShopCard component.
 * @interface ShopCardProps
 * @property {ShoppingItemType} shop - The shop data to display.
 */
interface ShopCardProps {
  shop: ShoppingItemType;
}

/**
 * Renders a card displaying information about a shop.
 *
 * @param {ShopCardProps} props - The props for the component.
 * @returns {ReactElement} The rendered shop card.
 */
export default function ShopCard({ shop }: ShopCardProps): ReactElement {
  const t = useTranslations(); // General translations
  const tFilters = useTranslations("Filters"); // For filter-related keys like shop types

  const shopName = t(shop.nameKey);
  const shopAddress = t(shop.addressKey);
  const shopOpeningHours = t(shop.openingHoursKey);
  // const shopDescription = t(shop.descriptionKey); // Could be used in a modal or detail view

  return (
    <Card className="w-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader className="p-0 relative h-48 w-full">
        <Image
          src={shop.imageUrl}
          alt={shopName}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-semibold mb-2 leading-tight">
          {shopName}
        </CardTitle>
        <div className="text-sm text-muted-foreground space-y-1.5">
          <div className="flex items-start">
            <MapPin className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
            <span>{shopAddress}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 shrink-0" />
            <span>{shopOpeningHours}</span>
          </div>
        </div>
        {shop.typeKeys && shop.typeKeys.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {shop.typeKeys.map((typeKey) => (
              <Badge key={typeKey} variant="secondary" className="text-xs">
                {tFilters(typeKey.startsWith("Filters.") ? typeKey : `Filters.Shopping.${typeKey}`)}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild variant="outline" className="w-full">
          <Link href="/explore/saarbruecken/example">
            {t("Common.viewDetails")} <ExternalLink className="ml-2 h-3 w-3" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
} 