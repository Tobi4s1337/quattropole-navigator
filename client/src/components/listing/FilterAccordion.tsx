"use client";

import type { ReactElement, ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/**
 * @file FilterAccordion.tsx
 * @description A reusable accordion component for displaying filter groups.
 */

/**
 * Props for the FilterAccordion component.
 * @interface FilterAccordionProps
 * @property {string} title - The title of the accordion section.
 * @property {ReactNode} children - The content to be displayed within the accordion (e.g., filter options).
 * @property {string} value - A unique value for the accordion item, used to control its open/closed state if part of a larger Accordion group.
 * @property {string} [defaultValue] - Optional. If this matches `value`, the accordion item will be open by default.
 */
interface FilterAccordionProps {
  title: string;
  children: ReactNode;
  value: string;
  defaultValue?: string;
}

/**
 * Renders a single accordion item for a filter group.
 *
 * @param {FilterAccordionProps} props - The props for the component.
 * @returns {ReactElement} The rendered accordion item.
 * @example
 * <FilterAccordion title="Shop Types" value="shop-types" defaultValue="shop-types">
 *   <p>Filter options here...</p>
 * </FilterAccordion>
 */
export default function FilterAccordion({
  title,
  children,
  value,
  defaultValue,
}: FilterAccordionProps): ReactElement {
  return (
    <Accordion type="single" collapsible className="w-full" defaultValue={defaultValue}>
      <AccordionItem value={value}>
        <AccordionTrigger className="text-base font-semibold hover:no-underline">
          {title}
        </AccordionTrigger>
        <AccordionContent className="pt-2">
          {children}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
} 