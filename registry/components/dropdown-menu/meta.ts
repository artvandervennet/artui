import type { ComponentMeta } from "../../lib/meta-types";

export const meta: ComponentMeta = {
  name: "DropdownMenu",
  description:
    "Accessible dropdown menu following the WAI-ARIA APG Menu Button pattern. Supports single-level submenus, typeahead, full keyboard navigation, and compile-time enforcement of accessible names on triggers and items.",
  status: "stable",
  files: ["dropdown-menu.tsx", "dropdown-menu.css"],
  registryDependencies: ["lib/a11y-types.ts", "lib/dev-overlay.tsx"],
  props: [
    {
      name: "open",
      type: "boolean",
      required: false,
      description:
        "When provided, puts the root into controlled mode. Must be paired with onOpenChange.",
    },
    {
      name: "onOpenChange",
      type: "(open: boolean) => void",
      required: false,
      description:
        "Called when the menu open state changes. Required when open is provided.",
    },
    {
      name: "children",
      type: "ReactNode",
      required: true,
      description:
        "Must contain exactly one Trigger and one Content. Other sub-components go inside Content.",
    },
    {
      name: "Trigger.children",
      type: "AccessibleText",
      required: false,
      description:
        "Visible label text. Exactly one of children, aria-label, or aria-labelledby is required — compile error otherwise.",
    },
    {
      name: "Trigger.aria-label",
      type: "AccessibleText",
      required: false,
      description: "Invisible label for icon-only triggers. Mutually exclusive with children and aria-labelledby.",
    },
    {
      name: "Trigger.aria-labelledby",
      type: "string",
      required: false,
      description: "ID of an external label element. Mutually exclusive with children and aria-label.",
    },
    {
      name: "Trigger.disabled",
      type: "boolean",
      required: false,
      description: "Disables the trigger button.",
    },
    {
      name: "Trigger.className",
      type: "string",
      required: false,
      description: "Additional CSS class applied to the trigger button.",
    },
    {
      name: "Content.children",
      type: "ReactNode",
      required: true,
      description: "Menu items, separators, and Sub groups. Empty content triggers a dev overlay.",
    },
    {
      name: "Content.className",
      type: "string",
      required: false,
      description: "Additional CSS class applied to the menu panel.",
    },
    {
      name: "Item.onSelect",
      type: "() => void",
      required: true,
      description: "Called when the item is activated by click, Enter, or Space.",
    },
    {
      name: "Item.disabled",
      type: "boolean",
      required: false,
      description: "Marks the item as aria-disabled and prevents selection.",
    },
    {
      name: "Item.className",
      type: "string",
      required: false,
      description: "Additional CSS class applied to the item element.",
    },
    {
      name: "Separator.className",
      type: "string",
      required: false,
      description: "Additional CSS class applied to the separator element.",
    },
    {
      name: "SubTrigger.children",
      type: "AccessibleText",
      required: false,
      description: "Visible label for the sub-trigger. One of children, aria-label, or aria-labelledby is required.",
    },
    {
      name: "SubTrigger.aria-label",
      type: "AccessibleText",
      required: false,
      description: "Invisible label for the sub-trigger.",
    },
    {
      name: "SubTrigger.aria-labelledby",
      type: "string",
      required: false,
      description: "External label element ID for the sub-trigger.",
    },
    {
      name: "SubTrigger.disabled",
      type: "boolean",
      required: false,
      description: "Disables the sub-trigger.",
    },
    {
      name: "SubContent.children",
      type: "ReactNode",
      required: true,
      description: "Items inside the sub-menu.",
    },
    {
      name: "SubContent.className",
      type: "string",
      required: false,
      description: "Additional CSS class applied to the sub-menu panel.",
    },
  ],
  accessibility: [
    {
      wcag: "1.3.1",
      description:
        "The menu panel has role=menu; each item has role=menuitem; the separator has role=separator. A dev overlay fires when Content renders with no children.",
    },
    {
      wcag: "2.1.1",
      description:
        "Full APG keyboard contract: Arrow Down/Up to navigate items, Home/End for first/last, Enter/Space to select, Escape to close, typeahead to jump by first character. ArrowRight opens a sub-menu; ArrowLeft or Escape closes it.",
    },
    {
      wcag: "2.4.3",
      description:
        "Focus moves to the first menu item on open. On close via Escape, focus returns to the trigger. Sub-menus return focus to the sub-trigger on close.",
    },
    {
      wcag: "2.4.7",
      description:
        "Focus indicators use outline (not box-shadow) to remain visible in Windows High Contrast Mode.",
    },
    {
      wcag: "2.5.5",
      description:
        "The trigger button has a minimum 44×44 px touch target.",
    },
    {
      wcag: "4.1.2",
      description:
        "Trigger carries aria-haspopup=menu, aria-expanded, and aria-controls. The menu carries aria-labelledby pointing at the trigger. Sub-triggers carry the same trio for their sub-menus. Accessible names on Trigger and SubTrigger are enforced at compile time via AccessibleNameProps.",
    },
  ],
  examples: [
    {
      name: "Basic menu",
      description: "Uncontrolled dropdown with items and a separator.",
      code: `<DropdownMenu>
  <DropdownMenu.Trigger>Account</DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Item onSelect={() => navigate('/profile')}>Profile</DropdownMenu.Item>
    <DropdownMenu.Item onSelect={() => navigate('/settings')}>Settings</DropdownMenu.Item>
    <DropdownMenu.Separator />
    <DropdownMenu.Item onSelect={signOut}>Sign out</DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu>`,
    },
    {
      name: "With submenu",
      description: "Single-level nested sub-menu.",
      code: `<DropdownMenu>
  <DropdownMenu.Trigger>Account</DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Item onSelect={() => navigate('/profile')}>Profile</DropdownMenu.Item>
    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger>Preferences</DropdownMenu.SubTrigger>
      <DropdownMenu.SubContent>
        <DropdownMenu.Item onSelect={() => setTheme('light')}>Light theme</DropdownMenu.Item>
        <DropdownMenu.Item onSelect={() => setTheme('dark')}>Dark theme</DropdownMenu.Item>
      </DropdownMenu.SubContent>
    </DropdownMenu.Sub>
  </DropdownMenu.Content>
</DropdownMenu>`,
    },
    {
      name: "Controlled",
      description: "Menu controlled by external state.",
      code: `const [open, setOpen] = useState(false);

<DropdownMenu open={open} onOpenChange={setOpen}>
  <DropdownMenu.Trigger>Account</DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Item onSelect={() => navigate('/profile')}>Profile</DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu>`,
    },
    {
      name: "Icon-only trigger",
      description: "Trigger with no visible text — aria-label provides the accessible name.",
      code: `<DropdownMenu>
  <DropdownMenu.Trigger aria-label="User menu">
    <UserIcon aria-hidden="true" />
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Item onSelect={signOut}>Sign out</DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu>`,
    },
    {
      name: "Disabled items",
      description: "Individual items can be disabled without disabling the whole menu.",
      code: `<DropdownMenu>
  <DropdownMenu.Trigger>Actions</DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Item onSelect={publish}>Publish</DropdownMenu.Item>
    <DropdownMenu.Item onSelect={archive} disabled>Archive (unavailable)</DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu>`,
    },
  ],
  related: ["Dialog"],
  donts: [
    {
      code: `<DropdownMenu.Trigger />`,
      reason:
        "No accessible name. Compile error — every Trigger must have children, aria-label, or aria-labelledby so screen reader users know what the menu is for.",
    },
    {
      code: `<DropdownMenu.Trigger>{""}</DropdownMenu.Trigger>`,
      reason:
        "Empty string is not an accessible name. Compile error — the AccessibleText type rejects placeholder values.",
    },
    {
      code: `<DropdownMenu.Item>Profile</DropdownMenu.Item>`,
      reason:
        "Missing onSelect. Compile error — every Item must declare what happens when it is selected.",
    },
    {
      code: `<DropdownMenu.Content>{false}</DropdownMenu.Content>`,
      reason:
        "Empty content. A dev overlay fires with WCAG 1.3.1. A menu with no items gives keyboard and screen reader users nothing to interact with.",
    },
  ],
};
