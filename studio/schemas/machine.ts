import { defineType, defineField } from "sanity";

export default defineType({
  name: "machine",
  title: "Machine",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Machine name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 64 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "type",
      title: "Type",
      type: "string",
      options: {
        list: [
          { title: "Pinball", value: "pinball" },
          { title: "Arcade", value: "arcade" },
          { title: "Racing", value: "racing" },
          { title: "Other", value: "other" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: "manufacturer", title: "Manufacturer", type: "string" }),
    defineField({ name: "year", title: "Year", type: "number" }),
    // ── OPDB sync fields (owned by the nightly cron, not by staff) ──────────
    defineField({
      name: "opdbId",
      title: "OPDB ID",
      type: "string",
      readOnly: true,
      description:
        "Open Pinball Database identifier. Set automatically by the nightly sync from the machine name. If a machine never resolves, the name probably doesn't match OPDB — rename to the canonical title or leave blank (manufacturer/year then stay staff-edited).",
    }),
    defineField({
      name: "opdbLastSynced",
      title: "OPDB last synced",
      type: "datetime",
      readOnly: true,
      description: "When the OPDB sync last reconciled this machine. Audit only.",
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      initialValue: "working",
      options: {
        list: [
          { title: "Working", value: "working" },
          { title: "Under maintenance", value: "maintenance" },
          { title: "Down", value: "down" },
        ],
      },
    }),
    defineField({
      name: "photo",
      title: "Photo",
      type: "image",
      options: { hotspot: true },
      fields: [
        {
          name: "alt",
          title: "Alt text (required)",
          type: "string",
          validation: (r) =>
            r
              .required()
              .min(4)
              .max(120),
          description:
            "Describe what's in the image for screen readers — e.g. 'Godzilla LE playfield with multiball lit'",
        },
      ],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "logoBackground",
      title: "Logo background",
      type: "string",
      initialValue: "light",
      options: {
        list: [
          { title: "Cream tile (for dark logos)", value: "light" },
          { title: "Dark (for pale or gold logos)", value: "dark" },
        ],
        layout: "radio",
      },
      description:
        "Most logos are dark and disappear on the dark page, so they sit on a cream tile by default. Switch to dark for pale or gold logos that wash out on cream — e.g. The Addams Family, KISS, AC/DC, Metallica.",
    }),
    defineField({
      name: "description",
      title: "Short description (web)",
      type: "text",
      rows: 4,
      validation: (r) => r.max(280),
    }),
    defineField({
      name: "conditionNote",
      title: "Condition note (internal)",
      type: "string",
    }),
    defineField({
      name: "highScore",
      title: "Current high score (optional)",
      type: "object",
      fields: [
        { name: "value", title: "Score", type: "string" },
        { name: "holder", title: "Held by", type: "string" },
        { name: "setOn", title: "Set on", type: "date" },
      ],
    }),
    defineField({
      name: "featured",
      title: "Feature on homepage",
      type: "boolean",
      initialValue: false,
    }),
    defineField({ name: "order", title: "Display order", type: "number" }),
  ],
  preview: {
    select: { title: "name", subtitle: "type", media: "photo", status: "status" },
    prepare: ({ title, subtitle, media, status }) => ({
      title,
      subtitle: `${subtitle} · ${status}`,
      media,
    }),
  },
});
