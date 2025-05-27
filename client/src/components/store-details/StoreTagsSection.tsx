"use client";

import type { ReactElement } from 'react';
import { Badge } from "@/components/ui/badge";
import { Tag } from "lucide-react";

/**
 * @file src/components/store-details/StoreTagsSection.tsx
 * @description Section displaying store tags/keywords (English strings hardcoded).
 */

interface StoreTagsSectionProps {
  tags: string[];
}

/**
 * Renders the tags section for a store.
 */
export default function StoreTagsSection({ tags }: StoreTagsSectionProps): ReactElement {
  if (!tags || tags.length === 0) {
    return <></>; 
  }

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold flex items-center">
        <Tag className="h-4 w-4 mr-2 text-primary" />
        Categories & Features
      </h3>
      
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <Badge 
            key={tag} 
            variant="outline" 
            className="px-2 py-1 text-xs font-medium bg-background hover:bg-muted/30"
          >
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
} 