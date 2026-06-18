import { defineType, defineField } from "sanity";

export default defineType({
  name: "functionEnquiry",
  title: "Function enquiry",
  type: "document",
  // Note: the document is no longer read-only at the type level — that locked
  // every field, including Status. Instead each *submitted* field is read-only
  // (so the customer's enquiry data can't be altered), while Status stays
  // editable so the team can move it new → replied → quoted → confirmed / lost.
  fields: [
    defineField({ name: "submittedAt", title: "Submitted at", type: "datetime", readOnly: true }),
    defineField({ name: "name", title: "Name", type: "string", readOnly: true }),
    defineField({ name: "email", title: "Email", type: "string", readOnly: true }),
    defineField({ name: "phone", title: "Phone", type: "string", readOnly: true }),
    defineField({ name: "groupSize", title: "Group size", type: "number", readOnly: true }),
    defineField({ name: "preferredDate", title: "Preferred date", type: "date", readOnly: true }),
    defineField({
      name: "preferredTime",
      title: "Preferred time window",
      type: "string",
      readOnly: true,
    }),
    defineField({ name: "occasion", title: "Occasion", type: "string", readOnly: true }),
    defineField({
      name: "machinePreference",
      title: "Machine preference",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "drinksStyle",
      title: "Drinks style",
      type: "string",
      options: { list: ["bar-tab", "cash-bar", "mixed"] },
      readOnly: true,
    }),
    defineField({ name: "food", title: "Food required", type: "boolean", readOnly: true }),
    defineField({ name: "notes", title: "Notes", type: "text", rows: 4, readOnly: true }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      initialValue: "new",
      options: {
        list: [
          { title: "New", value: "new" },
          { title: "Replied", value: "replied" },
          { title: "Quoted", value: "quoted" },
          { title: "Confirmed", value: "confirmed" },
          { title: "Lost", value: "lost" },
        ],
      },
    }),
    defineField({
      name: "calendarEventId",
      title: "Calendar event ID",
      type: "string",
      readOnly: true,
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "submittedAt", status: "status" },
    prepare: ({ title, subtitle, status }) => ({
      title,
      subtitle: `${new Date(subtitle).toLocaleDateString("en-AU")} · ${status}`,
    }),
  },
});
