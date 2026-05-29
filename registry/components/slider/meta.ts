import type { ComponentMeta } from "../../lib/meta-types";

export const meta: ComponentMeta = {
  name: "Slider",
  description:
    "Accessible slider for single-thumb and two-thumb range selection. Follows WAI-ARIA APG Slider and Slider (Multi-Thumb) patterns. Enforces per-thumb accessible names at compile time, wires aria-valuetext automatically from a format function, and keeps dependent aria-valuemin/aria-valuemax in sync when thumbs approach each other.",
  status: "stable",
  files: ["slider.tsx", "slider.css"],
  registryDependencies: ["lib/a11y-types.ts", "lib/dev-overlay.tsx"],
  props: [
    {
      name: "min",
      type: "number",
      required: false,
      defaultValue: "0",
      description: "Minimum value.",
    },
    {
      name: "max",
      type: "number",
      required: false,
      defaultValue: "100",
      description: "Maximum value.",
    },
    {
      name: "step",
      type: "number",
      required: false,
      defaultValue: "1",
      description:
        "Arrow-key step size. A dev overlay fires when step ≤ 0 or step > (max - min).",
    },
    {
      name: "largeStep",
      type: "number",
      required: false,
      defaultValue: "max(step * 10, (max - min) / 10)",
      description: "PageUp / PageDown jump size.",
    },
    {
      name: "disabled",
      type: "boolean",
      required: false,
      defaultValue: "false",
      description:
        "Disables interaction. Uses aria-disabled rather than the HTML disabled attribute so the thumb stays in the tab order for AT inspection.",
    },
    {
      name: "orientation",
      type: '"horizontal" | "vertical"',
      required: false,
      defaultValue: '"horizontal"',
      description: "Slider orientation.",
    },
    {
      name: "formatValue",
      type: "(value: number, thumbIndex: number) => string",
      required: false,
      description:
        "When provided, the returned string is wired to aria-valuetext on every thumb automatically. Use for non-numeric domains (e.g. '€250', 'Monday').",
    },
    {
      name: "value",
      type: "number | readonly [number, number]",
      required: false,
      description: "Controlled value. Pair with onValueChange.",
    },
    {
      name: "defaultValue",
      type: "number | readonly [number, number]",
      required: false,
      description: "Uncontrolled initial value.",
    },
    {
      name: "onValueChange",
      type: "((value: number) => void) | ((value: readonly [number, number]) => void)",
      required: false,
      description: "Called whenever the value changes.",
    },
    {
      name: "thumbs",
      type: "readonly [SliderThumbDescriptor, SliderThumbDescriptor]",
      required: false,
      description:
        "Range mode: exactly two thumb descriptors. Each must satisfy AccessibleNameProps: passing neither children, aria-label, nor aria-labelledby is a compile error.",
    },
    {
      name: "aria-label",
      type: "string",
      required: false,
      description:
        "Single-thumb: accessible name on the thumb button. Range: accessible name on the group wrapper. One of aria-label or aria-labelledby is required in range mode.",
    },
    {
      name: "aria-labelledby",
      type: "string",
      required: false,
      description:
        "Single-thumb: ID of an element that labels the thumb. Range: ID of the element that labels the group. A dev overlay fires when the ID does not resolve to a DOM element.",
    },
    {
      name: "showValues",
      type: "boolean",
      required: false,
      defaultValue: "false",
      description:
        "When true, visually displays the min/max bounds at the track ends and the live thumb value above each thumb. All visible text is aria-hidden; screen readers already receive the values via aria-valuenow and aria-valuetext on the thumb buttons. Formatted through formatValue when provided.",
    },
    {
      name: "className",
      type: "string",
      required: false,
      description: "Additional CSS class applied to the slider root element.",
    },
  ],
  accessibility: [
    {
      wcag: "1.3.1",
      description:
        "Single-thumb sliders inherit their accessible name from AccessibleNameProps (compile-time required). Range sliders wrap in role=\"group\" with aria-label or aria-labelledby; a dev overlay fires when neither is provided or when aria-labelledby points to a missing DOM element.",
    },
    {
      wcag: "2.1.1",
      description:
        "ArrowLeft/Right/Up/Down move the focused thumb by step. PageUp/PageDown move by largeStep (defaults to max(step*10, (max-min)/10) per APG). Home/End jump to the effective min/max. A dev overlay fires when step is invalid.",
    },
    {
      wcag: "2.1.2",
      description:
        "Each thumb is a native <button> in the natural tab order. No focus trap is installed; Tab and Shift+Tab always leave the slider.",
    },
    {
      wcag: "2.3.3",
      description:
        "Track-fill and thumb position transitions are gated on @media (prefers-reduced-motion: no-preference). With reduced motion the slider snaps without animation.",
    },
    {
      wcag: "2.4.3",
      description:
        "Tab order is constant regardless of visual thumb position. Thumb buttons are always rendered in the same DOM order (thumbs[0] first, thumbs[1] second); visual overlap is handled by z-index only.",
    },
    {
      wcag: "2.4.7",
      description:
        "Focus indicators use outline (not box-shadow) so they are visible in Windows High Contrast Mode.",
    },
    {
      wcag: "2.5.5",
      description:
        "Thumb buttons have a 44×44 CSS px hit area via a ::before pseudo-element, satisfying the recommended target size. The visual disc is smaller for aesthetics.",
    },
    {
      wcag: "3.2.2",
      description:
        "Adjusting the value never causes a context change: onValueChange is a local state update only.",
    },
    {
      wcag: "4.1.2",
      description:
        "Each thumb has role=\"slider\", aria-valuemin, aria-valuemax, aria-valuenow, aria-orientation, and its accessible name. aria-valuetext is wired automatically when formatValue is supplied. Range mode: per-thumb names enforced at compile time via the readonly [SliderThumbDescriptor, SliderThumbDescriptor] tuple. When a thumb's value crosses the other thumb's value (via keyboard or pointer drag), focus and value-identity transfer to the other thumb so the gesture continues seamlessly. Each thumb's aria-valuemin and aria-valuemax recompute on every render based on the current value ordering. Dev overlays fire for missing thumb names, out-of-range values, and type mismatches.",
    },
    {
      wcag: "1.4.11",
      description:
        "Bundled CSS uses system color tokens (Canvas, CanvasText, currentColor) that maintain 3:1 non-text contrast. Windows High Contrast Mode overrides apply ButtonFace/ButtonText/Highlight tokens.",
    },
  ],
  examples: [
    {
      name: "Single-thumb price slider",
      description: "Uncontrolled with aria-valuetext wired from formatValue.",
      code: `<Slider
  min={0}
  max={1000}
  step={10}
  defaultValue={250}
  aria-label="Maximum price"
  formatValue={(v) => \`€\${v}\`}
/>`,
    },
    {
      name: "Range slider",
      description: "Two-thumb range with per-thumb names enforced at compile time.",
      code: `<Slider
  min={0}
  max={1000}
  step={10}
  defaultValue={[100, 750]}
  aria-label="Price range"
  formatValue={(v) => \`€\${v}\`}
  thumbs={[
    { 'aria-label': 'Minimum price' },
    { 'aria-label': 'Maximum price' },
  ]}
/>`,
    },
    {
      name: "Non-numeric domain",
      description: "Weekday picker using formatValue for user-friendly value text.",
      code: `const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
<Slider
  min={0}
  max={6}
  step={1}
  defaultValue={1}
  aria-label="Pickup day"
  formatValue={(v) => days[v]}
/>`,
    },
    {
      name: "Vertical orientation",
      description: "Volume slider oriented vertically.",
      code: `<Slider
  min={0}
  max={100}
  step={1}
  defaultValue={50}
  orientation="vertical"
  aria-label="Volume"
/>`,
    },
    {
      name: "Controlled",
      description: "External state manages the value.",
      code: `const [price, setPrice] = useState(500);
<Slider
  min={0}
  max={1000}
  step={10}
  value={price}
  onValueChange={setPrice}
  aria-label="Budget"
  formatValue={(v) => \`€\${v}\`}
/>`,
    },
    {
      name: "Show values",
      description: "Display min/max bounds and the live thumb value visually. All visible text is aria-hidden; screen readers use aria-valuenow and aria-valuetext.",
      code: `<Slider
  min={0}
  max={100}
  step={1}
  defaultValue={40}
  aria-label="Volume"
  showValues
  formatValue={(v) => \`\${v}%\`}
/>`,
    },
  ],
  related: ["Accordion", "Dialog"],
  donts: [
    {
      code: `<Slider
  min={0} max={100}
  thumbs={[{}, {}]}
/>`,
      reason:
        "Empty thumb descriptors. Compile error: each SliderThumbDescriptor must satisfy AccessibleNameProps (aria-label, aria-labelledby, or children required).",
    },
    {
      code: `<Slider
  min={0} max={100}
  thumbs={[{ 'aria-label': 'Min' }, { 'aria-label': 'Max' }]}
/>`,
      reason:
        "Range slider without a group label. A dev overlay fires with WCAG 1.3.1 [Slider:range-without-group-name]. Add aria-label or aria-labelledby on the Slider root.",
    },
    {
      code: `<Slider min={0} max={100} defaultValue={150} aria-label="Speed" />`,
      reason:
        "defaultValue outside [min, max]. A dev overlay fires with WCAG 4.1.2 [Slider:value-out-of-range] and the value is clamped silently.",
    },
  ],
};
