import type { ComponentMeta } from "../../lib/meta-types";

export const meta: ComponentMeta = {
  name: "Datepicker",
  description:
    "Accessible date input with calendar popup. Follows WAI-ARIA APG Date Picker Dialog pattern. Passes all 9 WCAG criteria where peer libraries fail.",
  status: "stable",
  files: ["datepicker.tsx", "datepicker.css"],
  registryDependencies: ["lib/a11y-types.ts", "lib/dev-overlay.tsx"],
  props: [
    {
      name: "label",
      type: "AccessibleText",
      required: false,
      description:
        "Visible label for the date input. Exactly one of label, aria-label, or aria-labelledby is required; passing none or two is a compile error.",
    },
    {
      name: "aria-label",
      type: "AccessibleText",
      required: false,
      description:
        "Non-visible accessible name. Use when a visible label is not desired. Mutually exclusive with label and aria-labelledby.",
    },
    {
      name: "aria-labelledby",
      type: "string",
      required: false,
      description:
        "ID of an existing element that labels this input. Mutually exclusive with label and aria-label.",
    },
    {
      name: "value",
      type: "Date | null",
      required: true,
      description:
        "The currently selected date, or null when no date is selected.",
    },
    {
      name: "onChange",
      type: "(next: Date | null) => void",
      required: true,
      description:
        "Called when the user selects a date via the calendar or types a valid date.",
    },
    {
      name: "locale",
      type: "string",
      required: false,
      defaultValue: "navigator.language",
      description:
        "BCP-47 locale tag controlling date format and calendar week start. Defaults to the browser language. Passing an invalid BCP-47 tag triggers a dev overlay.",
    },
    {
      name: "min",
      type: "Date",
      required: false,
      description:
        "Earliest selectable date (inclusive). Days before this are disabled.",
    },
    {
      name: "max",
      type: "Date",
      required: false,
      description:
        "Latest selectable date (inclusive). Days after this are disabled.",
    },
    {
      name: "isDateDisabled",
      type: "(date: Date) => boolean",
      required: false,
      description: "Custom predicate to disable individual dates.",
    },
    {
      name: "error",
      type: "string",
      required: false,
      description:
        "External validation error message displayed below the input and wired to the input via aria-describedby.",
    },
    {
      name: "required",
      type: "boolean",
      required: false,
      description: "Maps to aria-required on the text input.",
    },
  ],
  accessibility: [
    {
      wcag: "1.3.1",
      description:
        "Text input is a first-class entry path. Parse errors are wired to the input via aria-describedby. The calendar heading is a semantic <h2>.",
    },
    {
      wcag: "2.1.1",
      description:
        "All controls are native <button> elements. Arrow keys navigate the day grid. Tab cycles only among prev/next/close buttons inside the dialog.",
    },
    {
      wcag: "2.1.2",
      description:
        "Focus trap inside the dialog is limited to three buttons (prev, next, close). Escape always exits. Selecting a date also exits.",
    },
    {
      wcag: "2.4.3",
      description:
        'DOM order enforces logical focus sequence: prev-month → next-month → close button. Dialog is role="dialog" with aria-labelledby pointing at the month/year <h2>.',
    },
    {
      wcag: "2.4.7",
      description:
        "Focus ring uses outline (not box-shadow) on every interactive element including day cells, preserving visibility in Windows High Contrast mode.",
    },
    {
      wcag: "3.3.1",
      description:
        "Invalid typed dates produce an error message that is referenced by the input's aria-describedby. External errors from the error prop are handled identically.",
    },
    {
      wcag: "3.3.2",
      description:
        "The label prop renders a visible <label> element. aria-label and aria-labelledby are alternate sources. Exactly one is required at compile time.",
    },
    {
      wcag: "4.1.2",
      description:
        'Selected day has aria-selected="true". Today has aria-current="date". Nav buttons have aria-label with the target month name. aria-haspopup="dialog" and aria-expanded on the trigger.',
    },
    {
      wcag: "4.1.3",
      description:
        'An aria-live="polite" aria-atomic region always present in the DOM announces the new month name when the user navigates between months.',
    },
  ],
  examples: [
    {
      name: "Controlled with visible label",
      description: "Standard controlled usage with a visible label.",
      code: `const [date, setDate] = useState<Date | null>(null);
<Datepicker label="Appointment date" value={date} onChange={setDate} />`,
    },
    {
      name: "With min/max range",
      description: "Restricts selectable dates to the current year.",
      code: `<Datepicker
  label="Event date"
  value={date}
  onChange={setDate}
  min={new Date(2026, 0, 1)}
  max={new Date(2026, 11, 31)}
/>`,
    },
    {
      name: "With isDateDisabled",
      description: "Blocks weekends from being selectable.",
      code: `<Datepicker
  label="Delivery date"
  value={date}
  onChange={setDate}
  isDateDisabled={(d) => d.getDay() === 0 || d.getDay() === 6}
/>`,
    },
    {
      name: "With external error",
      description: "Error from server-side validation wired to the input.",
      code: `<Datepicker
  label="Birth date"
  value={date}
  onChange={setDate}
  error={serverError}
/>`,
    },
    {
      name: "nl-BE locale",
      description:
        "Belgian Dutch locale with DD/MM/YYYY format and Monday week start.",
      code: `<Datepicker label="Datum" value={date} onChange={setDate} locale="nl-BE" />`,
    },
  ],
  related: ["Image"],
  donts: [
    {
      code: `<Datepicker value={date} onChange={setDate} />`,
      reason:
        "Missing label source. Compile error: every Datepicker must have label, aria-label, or aria-labelledby so screen reader users know what the field is for.",
    },
    {
      code: `<Datepicker label="Date" aria-label="Date" value={date} onChange={setDate} />`,
      reason:
        "Two label sources at once. Compile error: pass exactly one of label, aria-label, or aria-labelledby.",
    },
    {
      code: `<Datepicker label="Date" value={date} onChange={setDate} locale="not-a-locale" />`,
      reason:
        "Invalid BCP-47 locale tag; dev overlay fires and the component falls back to navigator.language.",
    },
  ],
};
