"use client";

import type { ReactElement } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { List, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * @file ViewModeToggle.tsx
 * @description Component to toggle between list and map views.
 */

/**
 * Defines the available view modes.
 * @enum {string}
 */
export enum ViewMode {
  List = "list",
  Map = "map",
}

/**
 * Props for the ViewModeToggle component.
 * @interface ViewModeToggleProps
 * @property {ViewMode} currentMode - The currently active view mode.
 * @property {(mode: ViewMode) => void} onModeChange - Callback when the view mode changes.
 */
interface ViewModeToggleProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

/**
 * Renders buttons to switch between list and map view modes.
 *
 * @param {ViewModeToggleProps} props - The props for the component.
 * @returns {ReactElement} The rendered view mode toggle buttons.
 * @example
 * <ViewModeToggle currentMode={viewMode} onModeChange={setViewMode} />
 */
export default function ViewModeToggle({
  currentMode,
  onModeChange,
}: ViewModeToggleProps): ReactElement {
  const t = useTranslations("ShoppingListingPage");

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={currentMode === ViewMode.List ? "default" : "outline"}
        onClick={() => onModeChange(ViewMode.List)}
        className={cn("flex items-center", {
          "bg-primary text-primary-foreground hover:bg-primary/90": currentMode === ViewMode.List,
        })}
        aria-pressed={currentMode === ViewMode.List}
        aria-label={t("listView")}
      >
        <List className="mr-2 h-4 w-4" />
        {t("listView")}
      </Button>
      <Button
        variant={currentMode === ViewMode.Map ? "default" : "outline"}
        onClick={() => onModeChange(ViewMode.Map)}
        className={cn("flex items-center", {
          "bg-primary text-primary-foreground hover:bg-primary/90": currentMode === ViewMode.Map,
        })}
        aria-pressed={currentMode === ViewMode.Map}
        aria-label={t("mapView")}
      >
        <MapPin className="mr-2 h-4 w-4" />
        {t("mapView")}
      </Button>
    </div>
  );
} 