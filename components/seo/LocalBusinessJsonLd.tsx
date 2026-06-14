interface DayHours {
  day: string;
  open?: string;
  close?: string;
  closed?: boolean;
}

interface Props {
  openingHours?: { weeklyHours?: DayHours[] } | null;
}

// Maps the three-letter day abbreviations from Sanity to schema.org day names
const DAY_MAP: Record<string, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};

function toSchemaTime(t: string): string {
  // schema.org expects HH:MM, same as the Sanity 24h storage format
  return t;
}

export function LocalBusinessJsonLd({ openingHours }: Props) {
  const hoursSpec = openingHours?.weeklyHours
    ?.filter((d) => !d.closed && d.open && d.close)
    .map((d) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: `https://schema.org/${DAY_MAP[d.day]}`,
      opens: toSchemaTime(d.open!),
      closes: toSchemaTime(d.close!),
    }));

  const schema = {
    "@context": "https://schema.org",
    "@type": "BarOrPub",
    name: "Beercade",
    address: {
      "@type": "PostalAddress",
      streetAddress: "113-115 Regent Street",
      addressLocality: "Redfern",
      addressRegion: "NSW",
      postalCode: "2016",
      addressCountry: "AU",
    },
    url: "https://beercade.com.au",
    telephone: "+61400112445",
    priceRange: "$$",
    // Coordinates for 113-115 Regent Street, Redfern, confirmed against the venue's
    // OpenStreetMap entry (id "Beercade, 113-115 Regent Street").
    geo: {
      "@type": "GeoCoordinates",
      latitude: -33.892226,
      longitude: 151.20079,
    },
    ...(hoursSpec?.length ? { openingHoursSpecification: hoursSpec } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
