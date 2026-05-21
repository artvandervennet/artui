import type { ComponentMeta } from "../../lib/meta-types";

export const meta: ComponentMeta = {
  name: "Accordion",
  description:
    "Accessible accordion built on native <details> / <summary>. Supports single-expand and multi-expand modes, controlled and uncontrolled state, keyboard navigation (ArrowDown/Up/Home/End), focus management into panels on expand, and compile-time enforcement of accessible trigger names.",
  status: "stable",
  files: ["accordion.tsx", "accordion.css"],
  registryDependencies: ["lib/a11y-types.ts", "lib/dev-overlay.tsx"],
  props: [
    {
      name: "headingLevel",
      type: "2 | 3 | 4 | 5 | 6",
      required: true,
      description:
        "Heading level rendered by every Accordion.Header. Required — no default, so authors must pick a level that fits the document outline.",
    },
    {
      name: "type",
      type: '"single" | "multiple"',
      required: false,
      defaultValue: '"single"',
      description:
        'Controls whether at most one item can be open ("single") or multiple items can be open simultaneously ("multiple").',
    },
    {
      name: "value",
      type: "string | string[]",
      required: false,
      description:
        "Controlled open value. String for single mode, string[] for multiple. Pair with onValueChange.",
    },
    {
      name: "defaultValue",
      type: "string | string[]",
      required: false,
      description: "Uncontrolled initial open value.",
    },
    {
      name: "onValueChange",
      type: "((value: string) => void) | ((value: string[]) => void)",
      required: false,
      description:
        "Called when the open state changes from a user interaction. Required when value is provided.",
    },
    {
      name: "children",
      type: "ReactNode",
      required: true,
      description:
        "One or more Accordion.Item elements. A dev overlay fires when no Items are rendered.",
    },
    {
      name: "className",
      type: "string",
      required: false,
      description: "Additional CSS class applied to the accordion root.",
    },
    {
      name: "Item.value",
      type: "string",
      required: true,
      description:
        "Stable identifier for this item. Must be unique within the accordion; a dev overlay fires on duplicate values.",
    },
    {
      name: "Item.disabled",
      type: "boolean",
      required: false,
      description:
        "Marks the item non-interactive. The summary receives aria-disabled=true and is excluded from Arrow-key navigation.",
    },
    {
      name: "Item.children",
      type: "ReactNode",
      required: true,
      description:
        "Must contain exactly one Accordion.Header (with Accordion.Trigger inside) and one Accordion.Panel.",
    },
    {
      name: "Trigger.children",
      type: "AccessibleText",
      required: false,
      description:
        "Visible label text for the trigger. Exactly one of children, aria-label, or aria-labelledby is required — compile error otherwise.",
    },
    {
      name: "Trigger.aria-label",
      type: "AccessibleText",
      required: false,
      description:
        "Invisible label for icon-only triggers. Mutually exclusive with children and aria-labelledby.",
    },
    {
      name: "Trigger.aria-labelledby",
      type: "string",
      required: false,
      description:
        "ID of an external label element. Mutually exclusive with children and aria-label.",
    },
    {
      name: "Panel.children",
      type: "ReactNode",
      required: true,
      description: "Content shown when the item is open.",
    },
    {
      name: "Panel.className",
      type: "string",
      required: false,
      description: "Additional CSS class applied to the panel element.",
    },
  ],
  accessibility: [
    {
      wcag: "1.3.1",
      description:
        "Built on native <details> / <summary> — the trigger-to-panel relationship is implicit in the DOM and communicated to assistive technology without aria-controls. aria-controls is also set explicitly as a defensive measure for older AT.",
    },
    {
      wcag: "1.3.3",
      description:
        "The expand/collapse indicator is a custom chevron rendered with aria-hidden=true. The UA disclosure marker is suppressed via CSS so it does not create a duplicate or confusing indicator.",
    },
    {
      wcag: "2.1.1",
      description:
        "Enter and Space toggle the disclosure natively. ArrowDown/Up/Home/End navigate between summaries without toggling (APG accordion keyboard contract). Disabled items are excluded from Arrow-key navigation.",
    },
    {
      wcag: "2.4.3",
      description:
        "On a user-initiated expand (click or Enter/Space), focus moves into the panel so screen reader users hear the newly revealed content immediately. Programmatic opens (controlled value changes) do not move focus.",
    },
    {
      wcag: "2.4.7",
      description:
        "Focus indicators use outline (not box-shadow) to remain visible in Windows High Contrast Mode.",
    },
    {
      wcag: "2.5.5",
      description:
        "The summary element has a minimum 44px block-size and is full-width, providing a 44×44 CSS px touch target.",
    },
    {
      wcag: "2.4.10",
      description:
        "Each item's trigger is wrapped in a real heading (h2–h6). headingLevel is required on the root with no default to force authors to choose a level that fits the page outline.",
    },
    {
      wcag: "4.1.2",
      description:
        "The summary carries aria-expanded (mirrors the open attribute for older AT) and aria-controls. Accessible names on Accordion.Trigger are enforced at compile time via AccessibleNameProps. Dev overlays fire for missing triggers, missing panels, duplicate values, and empty accordions.",
    },
  ],
  examples: [
    {
      name: "Basic single-expand",
      description: "Uncontrolled accordion where at most one item is open.",
      code: `<Accordion headingLevel={3}>
  <Accordion.Item value="intro">
    <Accordion.Header>
      <Accordion.Trigger>Introduction</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel>
      <p>Welcome to the FAQ section.</p>
    </Accordion.Panel>
  </Accordion.Item>
  <Accordion.Item value="usage">
    <Accordion.Header>
      <Accordion.Trigger>How do I use this?</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel>
      <p>Click any section header to expand it.</p>
    </Accordion.Panel>
  </Accordion.Item>
</Accordion>`,
    },
    {
      name: "Multi-expand",
      description: "Multiple items can be open simultaneously.",
      code: `<Accordion type="multiple" headingLevel={3}>
  <Accordion.Item value="a">
    <Accordion.Header>
      <Accordion.Trigger>Feature A</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel>Details about Feature A.</Accordion.Panel>
  </Accordion.Item>
  <Accordion.Item value="b">
    <Accordion.Header>
      <Accordion.Trigger>Feature B</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel>Details about Feature B.</Accordion.Panel>
  </Accordion.Item>
</Accordion>`,
    },
    {
      name: "Controlled",
      description: "Open state managed by external state.",
      code: `const [open, setOpen] = useState('');

<Accordion type="single" value={open} onValueChange={setOpen} headingLevel={3}>
  <Accordion.Item value="a">
    <Accordion.Header>
      <Accordion.Trigger>Section A</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel>Content A</Accordion.Panel>
  </Accordion.Item>
</Accordion>`,
    },
    {
      name: "With disabled item",
      description: "A disabled item is excluded from keyboard navigation.",
      code: `<Accordion headingLevel={3}>
  <Accordion.Item value="a">
    <Accordion.Header>
      <Accordion.Trigger>Active section</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel>Content</Accordion.Panel>
  </Accordion.Item>
  <Accordion.Item value="b" disabled>
    <Accordion.Header>
      <Accordion.Trigger>Locked section</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel>Unavailable content</Accordion.Panel>
  </Accordion.Item>
</Accordion>`,
    },
  ],
  related: ["Dialog", "DropdownMenu"],
  donts: [
    {
      code: `<Accordion.Trigger>{""}</Accordion.Trigger>`,
      reason:
        "Empty string is not an accessible name. Compile error — AccessibleText rejects placeholder values.",
    },
    {
      code: `<Accordion.Trigger>image</Accordion.Trigger>`,
      reason:
        "Placeholder strings like 'image' are not accessible names. Compile error.",
    },
    {
      code: `<Accordion.Item value="a"><Accordion.Panel>Panel only</Accordion.Panel></Accordion.Item>`,
      reason:
        "Item without a Trigger. A dev overlay fires with the key Accordion:item-without-trigger.",
    },
    {
      code: `<Accordion>{/* no items */}</Accordion>`,
      reason:
        "Accordion with no Items. A dev overlay fires with the key Accordion:empty.",
    },
  ],
};
