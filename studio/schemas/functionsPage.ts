import { defineType, defineField, defineArrayMember } from "sanity";

/**
 * Functions page — single editable document for everything on /functions that
 * isn't the enquiry form or the testimonials (those are the `testimonial`
 * type, tagged `functions`). Replaces the old per-tier `functionPackage`
 * documents, which described a pricing model the venue no longer runs.
 *
 * Queried with [0] like the other singletons (homepage, openingHours); there is
 * no desk-structure singleton enforcement, so treat the first document as
 * canonical and don't create a second.
 */
export default defineType({
  name: "functionsPage",
  title: "Functions page",
  type: "document",
  groups: [
    { name: "header", title: "Header" },
    { name: "contact", title: "Get in touch" },
    { name: "tokens", title: "Tokens & drinks" },
    { name: "foodHours", title: "Food & hours" },
  ],
  fields: [
    // ── Header ──────────────────────────────────────────────────────────────
    defineField({
      name: "kicker",
      title: "Kicker (overline)",
      type: "string",
      group: "header",
      description: 'Short overline above the title, e.g. "Private hire".',
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "header",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "lede",
      title: "Lede",
      type: "text",
      rows: 4,
      group: "header",
      description: "Intro paragraph under the title.",
    }),

    // ── Get in touch ────────────────────────────────────────────────────────
    defineField({
      name: "contactHeading",
      title: "Heading",
      type: "string",
      group: "contact",
    }),
    defineField({
      name: "contactIntro",
      title: "Intro",
      type: "text",
      rows: 3,
      group: "contact",
    }),
    defineField({
      name: "contactEmail",
      title: "Email address",
      type: "string",
      group: "contact",
    }),
    defineField({
      name: "contactPhoneName",
      title: "Phone contact name",
      type: "string",
      group: "contact",
      description: 'Who the caller reaches, e.g. "Roger".',
    }),
    defineField({
      name: "contactPhoneDisplay",
      title: "Phone (as shown)",
      type: "string",
      group: "contact",
      description: 'Formatted for reading, e.g. "0400 112 445".',
    }),
    defineField({
      name: "contactPhoneHref",
      title: "Phone (dial link)",
      type: "string",
      group: "contact",
      description: 'For the tel: link, in full international form, e.g. "+61400112445".',
    }),

    // ── Tokens & drinks ─────────────────────────────────────────────────────
    defineField({
      name: "tokensHeading",
      title: "Heading",
      type: "string",
      group: "tokens",
    }),
    defineField({
      name: "tokensIntro",
      title: "Intro",
      type: "text",
      rows: 3,
      group: "tokens",
    }),
    defineField({
      name: "tokenOptions",
      title: "Per-head options",
      type: "array",
      group: "tokens",
      of: [
        defineArrayMember({
          type: "object",
          name: "tokenOption",
          fields: [
            defineField({
              name: "heading",
              title: "Heading",
              type: "string",
              description: 'e.g. "Option 1 · $50pp" or "Option 4 · bulk tokens".',
              validation: (r) => r.required(),
            }),
            defineField({
              name: "description",
              title: "Description",
              type: "string",
            }),
            defineField({
              name: "mostPopular",
              title: "Tag as most popular",
              type: "boolean",
              description: "Adds the orange left border and MOST POPULAR tag.",
              initialValue: false,
            }),
          ],
          preview: {
            select: { title: "heading", subtitle: "description" },
          },
        }),
      ],
    }),
    defineField({
      name: "bulkHeading",
      title: "Bulk table — heading",
      type: "string",
      group: "tokens",
    }),
    defineField({
      name: "bulkRows",
      title: "Bulk table — rows",
      type: "array",
      group: "tokens",
      of: [
        defineArrayMember({
          type: "object",
          name: "bulkRow",
          fields: [
            defineField({
              name: "spend",
              title: "Spend",
              type: "string",
              description: 'e.g. "$100".',
              validation: (r) => r.required(),
            }),
            defineField({
              name: "tokens",
              title: "Tokens",
              type: "string",
              description: 'e.g. "125".',
              validation: (r) => r.required(),
            }),
          ],
          preview: {
            select: { title: "spend", subtitle: "tokens" },
            prepare({ title, subtitle }) {
              return { title: `${title} → ${subtitle} tokens` };
            },
          },
        }),
      ],
    }),
    defineField({
      name: "bulkNote",
      title: "Bulk table — note",
      type: "string",
      group: "tokens",
    }),
    defineField({
      name: "rules",
      title: "Rules (tokens / drink tickets)",
      type: "array",
      group: "tokens",
      of: [
        defineArrayMember({
          type: "object",
          name: "rule",
          fields: [
            defineField({
              name: "label",
              title: "Lead (bold)",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "body",
              title: "Body",
              type: "text",
              rows: 3,
            }),
          ],
          preview: { select: { title: "label", subtitle: "body" } },
        }),
      ],
    }),
    defineField({
      name: "licensedNote",
      title: "Licensing note",
      type: "text",
      rows: 2,
      group: "tokens",
    }),

    // ── Food & hours ────────────────────────────────────────────────────────
    defineField({
      name: "foodIntro",
      title: "Food — intro",
      type: "text",
      rows: 4,
      group: "foodHours",
    }),
    defineField({
      name: "deliveryPlaces",
      title: "Food — delivery options",
      type: "array",
      group: "foodHours",
      of: [
        defineArrayMember({
          type: "object",
          name: "deliveryPlace",
          fields: [
            defineField({
              name: "name",
              title: "Name",
              type: "string",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "url",
              title: "Link (optional)",
              type: "url",
            }),
            defineField({
              name: "note",
              title: "Note",
              type: "string",
              description: 'e.g. "great pizza".',
            }),
          ],
          preview: { select: { title: "name", subtitle: "note" } },
        }),
      ],
    }),
    defineField({
      name: "hoursNormallyOpen",
      title: "Hours — normally open",
      type: "string",
      group: "foodHours",
    }),
    defineField({
      name: "hoursAvailableForFunctions",
      title: "Hours — available for functions",
      type: "string",
      group: "foodHours",
    }),
    defineField({
      name: "freeHireNote",
      title: "Hours — free hire note",
      type: "text",
      rows: 3,
      group: "foodHours",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Functions page" };
    },
  },
});
