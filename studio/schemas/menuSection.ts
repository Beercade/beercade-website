import { defineType, defineField, defineArrayMember } from "sanity";

// One printed/on-screen menu section: Cocktails, Shots, Token packs, Jugs, etc.
// Sections are split across the two sides of the printed A3 sheet via `side`.
export default defineType({
  name: "menuSection",
  title: "Menu section",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Section title",
      type: "string",
      description: 'e.g. "Cocktails", "Shots", "Token packs", "Jugs".',
      validation: (r) => r.required(),
    }),
    defineField({
      name: "side",
      title: "Printed side",
      type: "string",
      options: {
        list: [
          { title: "Side 1 — Drinks", value: "drinks" },
          { title: "Side 2 — How to play & jugs", value: "play" },
        ],
        layout: "radio",
      },
      initialValue: "drinks",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "note",
      title: "Section note",
      type: "string",
      description:
        'Optional line under the title, e.g. "Cocktails contain between min 2 to max 3.5 shots of spirits or liqueurs".',
    }),
    defineField({
      name: "groups",
      title: "Groups",
      type: "array",
      description:
        'Items live inside groups. Give the group a heading when it has one (e.g. "Negroni", "Spritz"); leave the heading empty for a flat list like Shots.',
      of: [
        defineArrayMember({
          type: "object",
          name: "menuGroup",
          title: "Group",
          fields: [
            defineField({
              name: "heading",
              title: "Group heading",
              type: "string",
              description: 'Optional, e.g. "Negroni". Leave empty for a flat list.',
            }),
            defineField({
              name: "items",
              title: "Items",
              type: "array",
              of: [
                defineArrayMember({
                  type: "object",
                  name: "menuItem",
                  title: "Item",
                  fields: [
                    defineField({
                      name: "name",
                      title: "Name",
                      type: "string",
                      validation: (r) => r.required(),
                    }),
                    defineField({
                      name: "description",
                      title: "Description",
                      type: "text",
                      rows: 2,
                      description:
                        'Ingredients or detail, e.g. "Gin, Sweet Vermouth, Campari; over ice with orange peel, stir".',
                    }),
                    defineField({
                      name: "price",
                      title: "Price",
                      type: "string",
                      description:
                        'Free text so it can carry ranges and pairs, e.g. "20", "from 20–25", "Lager $24 / Ale $29". Leave empty for priceless lines (soft drinks, water).',
                    }),
                  ],
                  preview: {
                    select: { title: "name", subtitle: "price" },
                  },
                }),
              ],
              validation: (r) => r.min(1),
            }),
          ],
          preview: {
            select: { title: "heading", items: "items" },
            prepare({ title, items }) {
              const count = Array.isArray(items) ? items.length : 0;
              return {
                title: title || "(no heading)",
                subtitle: `${count} item${count === 1 ? "" : "s"}`,
              };
            },
          },
        }),
      ],
      validation: (r) => r.min(1),
    }),
    defineField({
      name: "footnotes",
      title: "Footnotes",
      type: "array",
      of: [{ type: "string" }],
      description:
        'Small print under the section, e.g. "Contains REAL peanuts", "Tokens do not expire".',
    }),
    defineField({
      name: "order",
      title: "Display order",
      type: "number",
      description: "Lower numbers appear first within their side.",
    }),
  ],
  orderings: [
    {
      title: "Side, then order",
      name: "sideOrder",
      by: [
        { field: "side", direction: "asc" },
        { field: "order", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: { title: "title", side: "side", order: "order" },
    prepare({ title, side, order }) {
      const sideLabel = side === "play" ? "Side 2" : "Side 1";
      return {
        title,
        subtitle: `${sideLabel}${typeof order === "number" ? ` · #${order}` : ""}`,
      };
    },
  },
});
