import { defineType, defineField } from "sanity";

export default defineType({
  name: "functionPackage",
  title: "Function package",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Package name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "bestFor",
      title: "Best for (overline)",
      type: "string",
      description: 'Short audience line, e.g. "Post-work · small birthdays".',
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "text",
      rows: 3,
      description: "One- or two-line description, shown in italics under the name.",
    }),
    defineField({
      name: "groupSize",
      title: "Group size",
      type: "string",
      description: 'Free text so it can carry a range or "30 to whole-venue", e.g. "15–30".',
    }),
    defineField({
      name: "price",
      title: "Guide price",
      type: "string",
      description: 'Free text, e.g. "$48 / head" or "From $X,XXX min spend".',
    }),
    defineField({
      name: "priceNote",
      title: "Price note",
      type: "string",
      description: 'Optional small print under the price, e.g. "minimum 8 people".',
    }),
    defineField({
      name: "inclusions",
      title: "What you get",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "toHold",
      title: "To hold it",
      type: "string",
      description: "Notice window + deposit, e.g. \"2–4 weeks' notice. Deposit $X, applied to your final bill.\"",
    }),
    defineField({
      name: "pitch",
      title: "One-line pitch",
      type: "string",
      description: "Closing line, pinned to the bottom of the card.",
    }),
    defineField({
      name: "featured",
      title: "Highlight as recommended",
      type: "boolean",
      description: 'Adds the "Most groups book this" tag and an orange border.',
      initialValue: false,
    }),
    defineField({
      name: "order",
      title: "Display order",
      type: "number",
      description: "Lower numbers appear first (left to right).",
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "price" },
  },
});
