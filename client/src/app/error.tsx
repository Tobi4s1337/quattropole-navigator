"use client";

import { ServerCrash } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useTranslations, NextIntlClientProvider } from "next-intl";

// Hardcoded English messages for the error page as a fallback.
// In a more complex setup, you might fetch these or use a very minimal set.
const fallbackMessages = {
  "Index": {
    "error": {
      "server": "Internal Server Error",
      "sorry": "Sorry, we encountered an unexpected issue on our server.",
      "tryAgain": " Try again later.", // Note: It was " Try again later." with a leading space, kept it as is from your file.
      "returnHome": "Return home"
    }
  }
  // You could add other minimal necessary translations here if your error page uses them
  // For instance, if the <Link href="/"> component needs a default locale or if Button text was from another namespace.
};

export default function ErrorPageWrapper({ // Renamed to avoid conflict if imported elsewhere, though not typical for error.tsx
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Provide a default locale and messages for the error page itself.
  // This ensures `useTranslations` has a context even if the main app context is broken.
  return (
    <NextIntlClientProvider locale="en" messages={fallbackMessages}>
      <ErrorContent error={error} reset={reset} />
    </NextIntlClientProvider>
  );
}

// Moved the original Error component content here
function ErrorContent({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  const t = useTranslations("Index.error");

  return (
    <html>
      <head>
        {/* Basic head elements can be useful for standalone error pages */}
        <title>{t("server")} - Error</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-background text-foreground">
          <div className="flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-destructive/10">
            <ServerCrash className="w-10 h-10 text-destructive" />
      </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {t("server")}
      </h1>
          <p className="mb-8 text-lg text-muted-foreground">
            {t("sorry")} {t("tryAgain")}
          </p>
      <div className="flex flex-col gap-4 sm:flex-row">
        <Button onClick={() => reset()} variant="default">
          {t("tryAgain")}
        </Button>
        <Button variant="outline" asChild>
              {/* This Link should ideally work without a specific locale context here,
                  or navigate to a known safe path like '/' which will then handle locale. */}
          <Link href="/">{t("returnHome")}</Link>
        </Button>
      </div>
    </div>
      </body>
    </html>
  );
}
