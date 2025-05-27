"use client";

import type { ReactElement } from 'react';
// import { useTranslations } from 'next-intl'; // Removed
import type { OpeningHoursSpecification } from 'schema-dts';
import { Clock, CalendarDays } from 'lucide-react';

/**
 * @file src/components/store-details/StoreOpeningHoursSection.tsx
 * @description Section displaying store opening hours (English strings hardcoded).
 */

/**
 * Props for the StoreOpeningHoursSection component.
 * @interface StoreOpeningHoursSectionProps
 * @property {OpeningHoursSpecification[]} openingHours - Array of opening hours specifications.
 */
interface StoreOpeningHoursSectionProps {
  openingHours: OpeningHoursSpecification[];
}

/**
 * Formats the day of the week for display.
 */
const formatDayOfWeek = (dayOfWeek: string | string[]): string => {
  if (Array.isArray(dayOfWeek)) {
    if (dayOfWeek.length === 0) return "";
    if (dayOfWeek.length === 1) return dayOfWeek[0]; // Already a string like "Monday"
    // Handle simple ranges, assumes days are in order e.g. ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    if (dayOfWeek.length === 5 && dayOfWeek[0] === "Monday" && dayOfWeek[4] === "Friday") {
        return "Monday - Friday";
    }
    return `${dayOfWeek[0]} - ${dayOfWeek[dayOfWeek.length - 1]}`;
  }
  return dayOfWeek; // Already a string like "Saturday"
};

/**
 * Formats opening hours for better readability.
 */
const formatHours = (opens: string, closes: string): string => {
  // Convert 24-hour format to 12-hour format with AM/PM for better readability
  const formatTime = (time: string): string => {
    if (!time || time === "00:00") return "";
    const [hours, minutes] = time.split(":");
    const hourNum = parseInt(hours, 10);
    const ampm = hourNum >= 12 ? "PM" : "AM";
    const hour12 = hourNum % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };
  
  if (opens === "00:00" && closes === "00:00") {
    return "Closed";
  }
  
  return `${formatTime(opens)} - ${formatTime(closes)}`;
};

/**
 * Renders the opening hours section for a store.
 */
export default function StoreOpeningHoursSection({ openingHours }: StoreOpeningHoursSectionProps): ReactElement {
  // const t = useTranslations('StoreDetailsPage'); // Removed
  // const tDays = useTranslations('Days'); // Removed
  // const tTime = useTranslations('Time'); // Removed

  const currentDayIndex = new Date().getDay();
  const schemaDayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDay = schemaDayOrder[currentDayIndex];

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold flex items-center">
        <Clock className="h-4 w-4 mr-2 text-primary" />
        Opening Hours
      </h3>
      
      {openingHours.length > 0 ? (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {openingHours.map((spec, index) => {
                const days = Array.isArray(spec.dayOfWeek) ? spec.dayOfWeek : [spec.dayOfWeek].filter(Boolean);
                const isCurrentDayRelevant = days.some(day => schemaDayOrder.indexOf(day as string) === currentDayIndex);
                const displayDays = formatDayOfWeek(spec.dayOfWeek!); 
                const timeDisplay = formatHours(spec.opens as string, spec.closes as string);
                const isClosed = spec.opens === "00:00" && spec.closes === "00:00";

                return (
                  <tr 
                    key={index} 
                    className={`border-b last:border-0 ${
                      isCurrentDayRelevant ? 'bg-primary/10' : ''
                    }`}
                  >
                    <td className={`py-2.5 px-3 ${isCurrentDayRelevant ? 'font-medium' : ''}`}>
                      {displayDays}
                      {isCurrentDayRelevant && (
                        <span className="ml-2 text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-sm">Today</span>
                      )}
                    </td>
                    <td className={`py-2.5 px-3 text-right ${isClosed ? 'text-red-500 font-medium' : isCurrentDayRelevant ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                      {timeDisplay}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-muted-foreground text-sm">
          <CalendarDays className="w-10 h-10 mb-2 opacity-40" />
          <p>Opening hours not available.</p>
        </div> 
      )}
    </div>
  );
} 