import type { ComponentMeta } from "../../lib/meta-types";

export const meta: ComponentMeta = {
  name: "Select",
  description:
    "Accessible dual-mode select control built on native HTML elements. Single mode renders a real styled <select> — platform provides all a11y for free. Multi mode renders a hidden <select multiple> as the form/value source of truth, paired with a unified Control field: chips (inline), a disclosure trigger button, an optional clear-all button, and a decorative caret — all siblings inside one bordered container. Selection is communicated via removable chips and aria-live announcements. Full keyboard contract per APG Listbox, compile-time accessible-name enforcement via AccessibleNameProps, and dev-overlay runtime guards for empty content, empty labels, and duplicate values.",
  status: "stable",
  files: ["select.tsx", "select.css"],
  registryDependencies: ["lib/a11y-types.ts", "lib/dev-overlay.tsx"],
  props: [
    {
      name: "multiple",
      type: "boolean",
      required: false,
      defaultValue: "false",
      description:
        "When true, switches to multi-select mode: renders a hidden <select multiple> and a custom ARIA listbox UI with Control, Content, and optional Group subcomponents. When absent or false, renders a plain native <select>.",
    },
    {
      name: "value",
      type: "string (single) | readonly string[] (multi)",
      required: false,
      description:
        "Controlled value. A single string in single mode; an array of strings in multi mode. Pair with onValueChange.",
    },
    {
      name: "defaultValue",
      type: "string (single) | readonly string[] (multi)",
      required: false,
      defaultValue: '"" / []',
      description: "Uncontrolled initial selection.",
    },
    {
      name: "onValueChange",
      type: "(value: string) => void (single) | (value: readonly string[]) => void (multi)",
      required: false,
      description: "Called whenever the selection changes.",
    },
    {
      name: "name",
      type: "string",
      required: false,
      description:
        "HTML name attribute forwarded to the native <select> (single) or hidden <select multiple> (multi) for form submission.",
    },
    {
      name: "open",
      type: "boolean",
      required: false,
      description:
        "Multi mode only. When provided, puts the listbox into controlled-open mode. Pair with onOpenChange.",
    },
    {
      name: "onOpenChange",
      type: "(open: boolean) => void",
      required: false,
      description: "Multi mode only. Called when the panel open state changes.",
    },
    {
      name: "disabled",
      type: "boolean",
      required: false,
      defaultValue: "false",
      description:
        "Disables the native select (single mode) or the trigger and all chip remove/clear-all buttons (multi mode).",
    },
    {
      name: "aria-label",
      type: "AccessibleText",
      required: false,
      description:
        "Single mode only. Accessible name for the native <select>. Exactly one of aria-label or aria-labelledby is required — compile error otherwise.",
    },
    {
      name: "aria-labelledby",
      type: "string",
      required: false,
      description:
        "Single mode only. ID of an external element that labels the native <select>.",
    },
    {
      name: "Control.aria-label",
      type: "AccessibleText",
      required: false,
      description:
        "Accessible name for the trigger button inside the field. Exactly one of aria-label, aria-labelledby, or children is required — compile error otherwise.",
    },
    {
      name: "Control.aria-labelledby",
      type: "string",
      required: false,
      description: "ID of an external element that labels the trigger button.",
    },
    {
      name: "Control.children",
      type: "AccessibleText",
      required: false,
      description: "Visible text label rendered inside the trigger button.",
    },
    {
      name: "Control.placeholder",
      type: "string",
      required: false,
      defaultValue: '"Select options"',
      description:
        "Text shown inside the trigger button when nothing is selected. Hidden when chips are present.",
    },
    {
      name: "Control.removeLabel",
      type: "(label: string) => string",
      required: false,
      description:
        "Customise the remove button's accessible name per chip. Defaults to `Remove ${label}`.",
    },
    {
      name: "Control.showClearAll",
      type: "boolean",
      required: false,
      defaultValue: "false",
      description:
        "When true, renders a clear-all button at the right of the field (left of the caret). Only visible when at least one option is selected.",
    },
    {
      name: "Control.clearAllLabel",
      type: "string",
      required: false,
      defaultValue: '"Clear all selections"',
      description: "Accessible name for the clear-all button.",
    },
    {
      name: "Control.className",
      type: "string",
      required: false,
      description: "Additional CSS class on the control field container.",
    },
    {
      name: "Content.children",
      type: "ReactNode",
      required: true,
      description:
        "Select.Option and Select.Group elements. An empty Content triggers a dev overlay (WCAG 1.3.1).",
    },
    {
      name: "Content.className",
      type: "string",
      required: false,
      description: "Additional CSS class on the listbox panel.",
    },
    {
      name: "Option.value",
      type: "string",
      required: true,
      description:
        "Unique identifier for this option. Duplicate values trigger a dev overlay (WCAG 4.1.2). In single mode maps to a native <option>; in multi mode maps to both a native <option> and an ARIA option div.",
    },
    {
      name: "Option.children",
      type: "ReactNode",
      required: true,
      description:
        "Visible label. Empty or whitespace-only children trigger a dev overlay (WCAG 1.3.1).",
    },
    {
      name: "Option.disabled",
      type: "boolean",
      required: false,
      description:
        "Marks the option as disabled. In single mode sets the native disabled attribute. In multi mode sets aria-disabled and excludes the option from keyboard navigation.",
    },
    {
      name: "Option.className",
      type: "string",
      required: false,
      description: "Additional CSS class on the option element (multi mode custom panel only).",
    },
    {
      name: "Group.label",
      type: "string",
      required: true,
      description:
        "Group heading. In single mode maps to <optgroup label>; in multi mode becomes role=group aria-label and a visible (aria-hidden) header. Empty label triggers a dev overlay (WCAG 1.3.1).",
    },
    {
      name: "Group.disabled",
      type: "boolean",
      required: false,
      description:
        "Disables the entire group. In single mode sets the disabled attribute on <optgroup>; in multi mode individual Option children must also be marked disabled for keyboard exclusion.",
    },
    {
      name: "Group.children",
      type: "ReactNode",
      required: true,
      description: "Select.Option elements inside this group.",
    },
    {
      name: "Group.className",
      type: "string",
      required: false,
      description: "Additional CSS class on the group container (multi mode custom panel only).",
    },
  ],
  accessibility: [
    {
      wcag: "1.3.1",
      description:
        "Selected options are communicated outside the listbox via removable chips inline in the Control field; each chip's remove button has an accessible name derived from the option label (default: 'Remove <label>', customisable via removeLabel). A visually-hidden aria-live=polite region announces every selection change ('Belgium added, 3 selected') and clear-all ('All selections cleared'). Dev overlays fire for: empty Content, empty/whitespace Option labels, empty Group labels. Option groups are conveyed semantically as role=group with aria-label in the custom panel and <optgroup label> in the hidden native select.",
    },
    {
      wcag: "2.1.1",
      description:
        "Single mode: keyboard fully delegated to the native <select>. Multi mode: Arrow Down/Up move focus between options (no wrap, APG Listbox); Home/End jump to first/last; Space or Enter toggle selection without closing; Escape closes and returns focus to trigger; Tab closes naturally; printable-character typeahead jumps to first match; Backspace on the trigger removes the last chip. All selection changes route through onValueChange (onChange-driven, registry masked-input rule).",
    },
    {
      wcag: "2.4.3",
      description:
        "Focus moves to the first focusable option when the multi-mode panel opens. Escape and Tab return focus to the trigger. Clear-all moves focus to the trigger after clearing. When the last chip is removed (via remove button or Backspace), focus is rescued to the trigger.",
    },
    {
      wcag: "2.4.7",
      description:
        "Focus indicators: the Control field shows a :focus-within outline scoped to :has(.artui-select-trigger:focus-visible), so only keyboard focus (not mouse clicks) triggers the ring. Individual chip remove buttons and the clear-all button have :focus-visible outlines. All indicators are visible in Windows High Contrast Mode via the forced-colors @media block.",
    },
    {
      wcag: "2.5.5",
      description:
        "All interactive elements have a minimum 44px touch target: native select (min-height), Control field (min-height 44px), chip remove buttons (padding), clear-all button (padding). The trigger fills the remaining field width, enlarging the click area proportionally.",
    },
    {
      wcag: "3.2.2",
      description:
        "Toggling an option in multi mode never causes an unexpected context change — onValueChange is a local state update only and the panel stays open.",
    },
    {
      wcag: "4.1.2",
      description:
        "Single mode: the native <select> carries role, name, and value automatically. Accessible name enforced at compile time. Multi mode: the trigger inside Control carries aria-haspopup=listbox, aria-expanded, aria-controls; accessible name enforced at compile time via AccessibleNameProps on Control. Custom panel carries role=listbox, aria-multiselectable=true, aria-labelledby. Each custom Option carries role=option and explicit aria-selected (true or false, never omitted). Hidden <select multiple> stays in sync for form submission. The Control container is a presentational div — no interactive nesting violations. Dev overlays fire for duplicate option values and empty content.",
    },
    {
      wcag: "4.1.3",
      description:
        "A visually-hidden role=status region with aria-live=polite and aria-atomic=true announces all selection changes and clear-all to screen readers.",
    },
    {
      wcag: "1.4.11",
      description:
        "CSS uses system color tokens (Canvas, ButtonFace, Highlight, ButtonText) in the forced-colors @media block, preserving 3:1 non-text contrast in Windows High Contrast Mode.",
    },
  ],
  examples: [
    {
      name: "Single mode",
      description: "Native <select> with accessible name and option groups.",
      code: `<label id="country-label">Country</label>
<Select aria-labelledby="country-label" name="country" onValueChange={setCountry}>
  <Select.Group label="Benelux">
    <Select.Option value="be">Belgium</Select.Option>
    <Select.Option value="nl">Netherlands</Select.Option>
  </Select.Group>
  <Select.Option value="fr">France</Select.Option>
</Select>`,
    },
    {
      name: "Multi mode — basic uncontrolled",
      description: "Unified control field with removable chips and a custom listbox.",
      code: `<Select multiple defaultValue={["be"]} onValueChange={setCountries}>
  <Select.Control aria-label="Countries" />
  <Select.Content>
    <Select.Option value="be">Belgium</Select.Option>
    <Select.Option value="nl">Netherlands</Select.Option>
    <Select.Option value="fr" disabled>France</Select.Option>
  </Select.Content>
</Select>`,
    },
    {
      name: "Multi mode — with groups",
      description: "Options organised into accessible groups.",
      code: `<Select multiple defaultValue={["be"]} onValueChange={setCountries}>
  <Select.Control aria-label="Countries" />
  <Select.Content>
    <Select.Group label="Benelux">
      <Select.Option value="be">Belgium</Select.Option>
      <Select.Option value="nl">Netherlands</Select.Option>
      <Select.Option value="lu">Luxembourg</Select.Option>
    </Select.Group>
    <Select.Group label="Other">
      <Select.Option value="fr">France</Select.Option>
      <Select.Option value="de">Germany</Select.Option>
    </Select.Group>
  </Select.Content>
</Select>`,
    },
    {
      name: "Multi mode — with clear-all",
      description: "Clear-all button lets users remove all chips at once.",
      code: `<Select multiple defaultValue={["be", "nl"]} onValueChange={setCountries}>
  <Select.Control aria-label="Countries" showClearAll clearAllLabel="Clear all countries" />
  <Select.Content>
    <Select.Option value="be">Belgium</Select.Option>
    <Select.Option value="nl">Netherlands</Select.Option>
    <Select.Option value="fr">France</Select.Option>
  </Select.Content>
</Select>`,
    },
    {
      name: "Multi mode — controlled",
      description: "External state manages the selection.",
      code: `const [countries, setCountries] = useState<readonly string[]>(['be']);

<Select multiple value={countries} onValueChange={setCountries}>
  <Select.Control aria-label="Countries" />
  <Select.Content>
    <Select.Option value="be">Belgium</Select.Option>
    <Select.Option value="nl">Netherlands</Select.Option>
  </Select.Content>
</Select>`,
    },
    {
      name: "Multi mode — custom remove label (i18n)",
      description: "Override the remove-button accessible name for localisation.",
      code: `<Select multiple defaultValue={["be"]} onValueChange={setCountries}>
  <Select.Control
    aria-label="Pays"
    removeLabel={(label) => \`Supprimer \${label}\`}
  />
  <Select.Content>
    <Select.Option value="be">Belgique</Select.Option>
  </Select.Content>
</Select>`,
    },
  ],
  related: ["DropdownMenu"],
  donts: [
    {
      code: `<Select onValueChange={noop}>
  <Select.Option value="be">Belgium</Select.Option>
</Select>`,
      reason:
        "Single mode with no accessible name. Compile error — aria-label or aria-labelledby is required so screen reader users know what the control is for.",
    },
    {
      code: `<Select.Control />`,
      reason:
        "No accessible name on Control. Compile error — every multi-mode Control must have aria-label, aria-labelledby, or children.",
    },
    {
      code: `<Select.Content>{false}</Select.Content>`,
      reason:
        "Empty Content. A dev overlay fires with WCAG 1.3.1. A listbox with no options gives keyboard and screen reader users nothing to interact with.",
    },
    {
      code: `<Select.Option value="x">{"  "}</Select.Option>`,
      reason:
        "Whitespace-only label. A dev overlay fires with WCAG 1.3.1. Screen readers announce nothing useful for this option.",
    },
    {
      code: `<Select.Option value="x">A</Select.Option>
<Select.Option value="x">B</Select.Option>`,
      reason:
        "Duplicate value. A dev guard logs with WCAG 4.1.2. Duplicate values make selection state ambiguous for both the UI and assistive technology.",
    },
    {
      code: `<Select.Group label="">
  <Select.Option value="be">Belgium</Select.Option>
</Select.Group>`,
      reason:
        "Empty group label. A dev overlay fires with WCAG 1.3.1. Screen readers cannot identify the group.",
    },
  ],
};
