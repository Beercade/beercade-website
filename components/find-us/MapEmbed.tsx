const MAP_SRC =
  "https://maps.google.com/maps?q=113+Regent+Street,+Redfern+NSW+2016&output=embed";

interface MapEmbedProps {
  /** Map height in px. Defaults to 400. */
  height?: number;
  /** Extra classes on the figure wrapper. */
  className?: string;
}

/**
 * Embedded Google Map for the venue. Uses the keyless `output=embed` iframe and
 * `loading="lazy"`, so the Google frame only loads when scrolled into view.
 */
export function MapEmbed({ height = 400, className = "" }: MapEmbedProps) {
  return (
    <figure className={`overflow-hidden rounded-sm ${className}`}>
      <iframe
        src={MAP_SRC}
        title="Beercade location — 113 Regent Street, Redfern NSW 2016"
        width="100%"
        height={height}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="block w-full border-0"
      />
      <figcaption className="sr-only">
        Map of Beercade — 113 Regent Street, Redfern NSW 2016. Served by Google
        Maps.
      </figcaption>
    </figure>
  );
}
