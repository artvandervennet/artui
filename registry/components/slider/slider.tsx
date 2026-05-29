import {
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { type AccessibleNameProps } from "../../lib/a11y-types";
import { withErrorOverlay } from "../../lib/dev-overlay";

import "./slider.css";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SliderThumbDescriptor = AccessibleNameProps & {
  formatValue?: (value: number) => string;
};

type SliderCommonProps = {
  min?: number;
  max?: number;
  step?: number;
  largeStep?: number;
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
  formatValue?: (value: number, thumbIndex: number) => string;
  showValues?: boolean;
  className?: string;
};

type SliderSingleProps = SliderCommonProps &
  AccessibleNameProps & {
    value?: number;
    defaultValue?: number;
    onValueChange?: (value: number) => void;
    thumbs?: never;
  };

type SliderRangeProps = SliderCommonProps & {
  thumbs: readonly [SliderThumbDescriptor, SliderThumbDescriptor];
  value?: readonly [number, number];
  defaultValue?: readonly [number, number];
  onValueChange?: (value: readonly [number, number]) => void;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

export type SliderProps = SliderSingleProps | SliderRangeProps;

// ---------------------------------------------------------------------------
// Module helpers
// ---------------------------------------------------------------------------

const isDev =
  typeof process !== "undefined" && process.env.NODE_ENV !== "production";

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function snapToStep(value: number, min: number, step: number): number {
  const steps = Math.round((value - min) / step);
  return min + steps * step;
}

function sanitizeValue(
  value: number,
  min: number,
  max: number,
  step: number,
): number {
  return clamp(snapToStep(value, min, step), min, max);
}

function resolveStep(
  step: number | undefined,
  min: number,
  max: number,
): number {
  if (step !== undefined && step > 0 && step <= max - min) return step;
  return (max - min) / 100;
}

function resolveLargeStep(
  largeStep: number | undefined,
  step: number,
  min: number,
  max: number,
): number {
  if (largeStep !== undefined && largeStep > 0) return largeStep;
  return Math.max(step * 10, (max - min) / 10);
}

function thumbPercent(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return ((value - min) / (max - min)) * 100;
}

function getNameProps(
  descriptor: AccessibleNameProps,
): { "aria-label"?: string; "aria-labelledby"?: string } {
  const d = descriptor as {
    children?: string;
    "aria-label"?: string;
    "aria-labelledby"?: string;
  };
  return {
    ...(d["aria-label"] !== undefined ? { "aria-label": d["aria-label"] } : {}),
    ...(d["aria-labelledby"] !== undefined
      ? { "aria-labelledby": d["aria-labelledby"] }
      : {}),
    // children on AccessibleNameProps is used as the accessible label text
    ...(d.children !== undefined ? { "aria-label": d.children } : {}),
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Slider(props: SliderProps): ReactElement {
  const {
    min: minProp = 0,
    max: maxProp = 100,
    step: stepProp,
    largeStep: largeStepProp,
    disabled = false,
    orientation = "horizontal",
    formatValue: rootFormatValue,
    showValues = false,
    className,
  } = props;

  const isRange = "thumbs" in props && props.thumbs !== undefined;
  const uid = useId();

  const step = resolveStep(stepProp, minProp, maxProp);
  const largeStep = resolveLargeStep(largeStepProp, step, minProp, maxProp);

  // ---------------------------------------------------------------------------
  // Controlled vs uncontrolled state
  // ---------------------------------------------------------------------------

  const isControlledSingle =
    !isRange && (props as SliderSingleProps).value !== undefined;
  const isControlledRange =
    isRange && (props as SliderRangeProps).value !== undefined;

  const defaultSingle = (props as SliderSingleProps).defaultValue ?? minProp;
  const defaultRange = (props as SliderRangeProps).defaultValue ?? [
    minProp,
    maxProp,
  ];

  const [internalSingle, setInternalSingle] = useState<number>(() =>
    sanitizeValue(defaultSingle, minProp, maxProp, step),
  );
  const [internalRange, setInternalRange] = useState<readonly [number, number]>(
    () => [
      sanitizeValue(defaultRange[0], minProp, maxProp, step),
      sanitizeValue(defaultRange[1], minProp, maxProp, step),
    ],
  );

  // Effective values (controlled overrides internal)
  let singleValue: number;
  let rangeValues: readonly [number, number];

  if (isRange) {
    const controlled = (props as SliderRangeProps).value;
    if (isControlledRange && controlled !== undefined) {
      rangeValues = [
        sanitizeValue(controlled[0], minProp, maxProp, step),
        sanitizeValue(controlled[1], minProp, maxProp, step),
      ];
    } else {
      rangeValues = internalRange;
    }
    singleValue = 0; // unused
  } else {
    const controlled = (props as SliderSingleProps).value;
    if (isControlledSingle && controlled !== undefined) {
      singleValue = sanitizeValue(controlled, minProp, maxProp, step);
    } else {
      singleValue = internalSingle;
    }
    rangeValues = [0, 0]; // unused
  }

  // ---------------------------------------------------------------------------
  // Refs for drag state
  // ---------------------------------------------------------------------------

  const trackRef = useRef<HTMLDivElement>(null);
  const thumb0Ref = useRef<HTMLButtonElement>(null);
  const thumb1Ref = useRef<HTMLButtonElement>(null);
  const draggingThumbRef = useRef<number | null>(null);

  // ---------------------------------------------------------------------------
  // Value change dispatchers
  // ---------------------------------------------------------------------------

  const commitSingle = useCallback(
    (next: number) => {
      const clamped = sanitizeValue(next, minProp, maxProp, step);
      if (!isControlledSingle) setInternalSingle(clamped);
      (props as SliderSingleProps).onValueChange?.(clamped);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [minProp, maxProp, step, isControlledSingle],
  );

  const commitRange = useCallback(
    (next: readonly [number, number]) => {
      const clamped: [number, number] = [
        sanitizeValue(next[0], minProp, maxProp, step),
        sanitizeValue(next[1], minProp, maxProp, step),
      ];
      if (!isControlledRange) setInternalRange(clamped);
      (props as SliderRangeProps).onValueChange?.(clamped);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [minProp, maxProp, step, isControlledRange],
  );

  // ---------------------------------------------------------------------------
  // Track-click: move nearest thumb to click position
  // ---------------------------------------------------------------------------

  function handleTrackPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (disabled) return;
    const track = trackRef.current;
    if (!track) return;

    const rect = track.getBoundingClientRect();
    const ratio =
      orientation === "vertical"
        ? 1 - (e.clientY - rect.top) / rect.height
        : (e.clientX - rect.left) / rect.width;

    const clickedValue = clamp(
      minProp + ratio * (maxProp - minProp),
      minProp,
      maxProp,
    );

    if (!isRange) {
      commitSingle(clickedValue);
      thumb0Ref.current?.focus();
      return;
    }

    const [lo, hi] = rangeValues;
    const distLo = Math.abs(clickedValue - lo);
    const distHi = Math.abs(clickedValue - hi);
    if (distLo <= distHi) {
      commitRange([clamp(snapToStep(clickedValue, minProp, step), minProp, maxProp), hi]);
      thumb0Ref.current?.focus();
    } else {
      commitRange([lo, clamp(snapToStep(clickedValue, minProp, step), minProp, maxProp)]);
      thumb1Ref.current?.focus();
    }
  }

  // ---------------------------------------------------------------------------
  // Pointer drag: setPointerCapture on thumb
  // ---------------------------------------------------------------------------

  function handleThumbPointerDown(
    e: ReactPointerEvent<HTMLButtonElement>,
    thumbIndex: number,
  ) {
    if (disabled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    draggingThumbRef.current = thumbIndex;
  }

  function handleThumbPointerMove(
    e: ReactPointerEvent<HTMLButtonElement>,
    thumbIndex: number,
  ) {
    if (disabled || draggingThumbRef.current !== thumbIndex) return;
    const track = trackRef.current;
    if (!track) return;

    const rect = track.getBoundingClientRect();
    const ratio =
      orientation === "vertical"
        ? 1 - (e.clientY - rect.top) / rect.height
        : (e.clientX - rect.left) / rect.width;

    const draggedValue = clamp(
      minProp + ratio * (maxProp - minProp),
      minProp,
      maxProp,
    );

    if (!isRange) {
      commitSingle(draggedValue);
      return;
    }

    const proposed = clamp(snapToStep(draggedValue, minProp, step), minProp, maxProp);
    const otherIndex = thumbIndex === 0 ? 1 : 0;
    const otherValue = rangeValues[otherIndex];

    const crosses =
      (thumbIndex === 0 && proposed > otherValue) ||
      (thumbIndex === 1 && proposed < otherValue);

    if (crosses) {
      const otherRef = otherIndex === 0 ? thumb0Ref : thumb1Ref;
      e.currentTarget.releasePointerCapture(e.pointerId);
      draggingThumbRef.current = otherIndex;
      otherRef.current?.setPointerCapture(e.pointerId);
      otherRef.current?.focus();
      const newTuple: [number, number] =
        thumbIndex === 0
          ? [otherValue, proposed]
          : [proposed, otherValue];
      commitRange(newTuple);
    } else {
      const newTuple: [number, number] =
        thumbIndex === 0
          ? [proposed, rangeValues[1]]
          : [rangeValues[0], proposed];
      commitRange(newTuple);
    }
  }

  function handleThumbPointerUp(e: ReactPointerEvent<HTMLButtonElement>) {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    draggingThumbRef.current = null;
  }

  // ---------------------------------------------------------------------------
  // Keyboard handler
  // ---------------------------------------------------------------------------

  function handleThumbKeyDown(
    e: KeyboardEvent<HTMLButtonElement>,
    thumbIndex: number,
  ) {
    if (disabled) return;

    const currentValue: number =
      isRange ? (rangeValues[thumbIndex] ?? singleValue) : singleValue;

    let delta: number | null = null;
    let absolute: number | null = null;

    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
        e.preventDefault();
        delta = step;
        break;
      case "ArrowLeft":
      case "ArrowDown":
        e.preventDefault();
        delta = -step;
        break;
      case "PageUp":
        e.preventDefault();
        delta = largeStep;
        break;
      case "PageDown":
        e.preventDefault();
        delta = -largeStep;
        break;
      case "Home":
        e.preventDefault();
        absolute = minProp;
        break;
      case "End":
        e.preventDefault();
        absolute = maxProp;
        break;
    }

    if (delta === null && absolute === null) return;

    const proposed =
      absolute !== null
        ? absolute
        : clamp(snapToStep(currentValue + delta!, minProp, step), minProp, maxProp);

    if (!isRange) {
      commitSingle(proposed);
      return;
    }

    const otherIndex = thumbIndex === 0 ? 1 : 0;
    const otherValue = rangeValues[otherIndex];
    const otherRef = otherIndex === 0 ? thumb0Ref : thumb1Ref;

    const crosses =
      (thumbIndex === 0 && proposed > otherValue) ||
      (thumbIndex === 1 && proposed < otherValue);

    if (crosses) {
      // Full step always applied: other slot absorbs new value, this slot pins to other's old value.
      const newTuple: [number, number] =
        thumbIndex === 0
          ? [otherValue, proposed]
          : [proposed, otherValue];
      commitRange(newTuple);
      otherRef.current?.focus();
    } else {
      const newTuple: [number, number] =
        thumbIndex === 0
          ? [proposed, rangeValues[1]]
          : [rangeValues[0], proposed];
      commitRange(newTuple);
    }
  }

  // ---------------------------------------------------------------------------
  // Slider:range-without-group-name: labelledby-target-missing variant
  // Cannot be checked in render body because sibling DOM isn't committed yet.
  // Fires console.error only (no overlay) when aria-labelledby resolves to null.
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!isDev || !isRange) return;
    const rp = props as SliderRangeProps;
    const groupLabelledBy = rp["aria-labelledby"];
    if (groupLabelledBy && !document.getElementById(groupLabelledBy)) {
      console.error(
        `[artui] <Slider> [WCAG 1.3.1] [Slider:range-without-group-name]: aria-labelledby="${groupLabelledBy}" does not resolve to any element in the DOM. The slider group has no accessible name.`,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  function renderThumb(
    thumbIndex: number,
    value: number,
    valueMin: number,
    valueMax: number,
    nameDescriptor: AccessibleNameProps,
    thumbFormatValue?: (v: number) => string,
  ): ReactElement {
    const ref = thumbIndex === 0 ? thumb0Ref : thumb1Ref;
    const percent = thumbPercent(value, minProp, maxProp);
    const posStyle =
      orientation === "vertical"
        ? { bottom: `${percent}%` }
        : { left: `${percent}%` };

    const nameProps = getNameProps(nameDescriptor);

    // Fallback label for JS consumers who bypass type safety
    const hasName = nameProps["aria-label"] || nameProps["aria-labelledby"];
    const fallbackLabel = !hasName
      ? { "aria-label": `Thumb ${thumbIndex + 1}` }
      : {};

    const valueText =
      thumbFormatValue?.(value) ?? rootFormatValue?.(value, thumbIndex);

    return (
      <button
        key={thumbIndex}
        ref={ref}
        type="button"
        role="slider"
        aria-valuemin={valueMin}
        aria-valuemax={valueMax}
        aria-valuenow={value}
        {...(valueText !== undefined ? { "aria-valuetext": valueText } : {})}
        aria-orientation={orientation}
        aria-disabled={disabled ? "true" : undefined}
        tabIndex={disabled ? -1 : 0}
        className="artui-slider-thumb"
        style={posStyle}
        {...nameProps}
        {...fallbackLabel}
        onKeyDown={(e) => handleThumbKeyDown(e, thumbIndex)}
        onPointerDown={(e) => handleThumbPointerDown(e, thumbIndex)}
        onPointerMove={(e) => handleThumbPointerMove(e, thumbIndex)}
        onPointerUp={handleThumbPointerUp}
        onPointerCancel={handleThumbPointerUp}
      />
    );
  }

  // ---------------------------------------------------------------------------
  // Render: single
  // ---------------------------------------------------------------------------

  if (!isRange) {
    const sp = props as SliderSingleProps;
    const nameProps = getNameProps(sp as AccessibleNameProps);
    const valueText = rootFormatValue?.(singleValue, 0);
    const percent = thumbPercent(singleValue, minProp, maxProp);
    const fillStyle =
      orientation === "vertical"
        ? { height: `${percent}%`, bottom: 0 }
        : { width: `${percent}%`, left: 0 };

    // Format helpers for bound labels — reuse rootFormatValue so visible text matches aria-valuetext.
    const minLabel = rootFormatValue ? rootFormatValue(minProp, 0) : String(minProp);
    const maxLabel = rootFormatValue ? rootFormatValue(maxProp, 0) : String(maxProp);
    const thumbLabel = valueText ?? String(singleValue);
    const thumbValueStyle =
      orientation === "vertical"
        ? { bottom: `${percent}%` }
        : { left: `${percent}%` };

    const element = (
      <div
        data-orientation={orientation}
        data-disabled={disabled ? "true" : undefined}
        data-show-values={showValues ? "true" : undefined}
        className={["artui-slider", className].filter(Boolean).join(" ")}
      >
        {showValues && (
          <span aria-hidden="true" className="artui-slider-min">{minLabel}</span>
        )}
        <div
          ref={trackRef}
          className="artui-slider-track"
          onPointerDown={handleTrackPointerDown}
        >
          <div className="artui-slider-fill" style={fillStyle} />
          <button
            ref={thumb0Ref}
            type="button"
            role="slider"
            aria-valuemin={minProp}
            aria-valuemax={maxProp}
            aria-valuenow={singleValue}
            {...(valueText !== undefined ? { "aria-valuetext": valueText } : {})}
            aria-orientation={orientation}
            aria-disabled={disabled ? "true" : undefined}
            tabIndex={disabled ? -1 : 0}
            className="artui-slider-thumb"
            style={
              orientation === "vertical"
                ? { bottom: `${percent}%` }
                : { left: `${percent}%` }
            }
            {...nameProps}
            onKeyDown={(e) => handleThumbKeyDown(e, 0)}
            onPointerDown={(e) => handleThumbPointerDown(e, 0)}
            onPointerMove={(e) => handleThumbPointerMove(e, 0)}
            onPointerUp={handleThumbPointerUp}
            onPointerCancel={handleThumbPointerUp}
          />
          {showValues && (
            <span
              aria-hidden="true"
              className="artui-slider-value"
              style={thumbValueStyle}
            >
              {thumbLabel}
            </span>
          )}
        </div>
        {showValues && (
          <span aria-hidden="true" className="artui-slider-max">{maxLabel}</span>
        )}
      </div>
    );

    // Slider:invalid-step (2.1.1)
    if (
      isDev &&
      stepProp !== undefined &&
      (stepProp <= 0 || stepProp > maxProp - minProp)
    ) {
      return withErrorOverlay(element, {
        key: "Slider:invalid-step",
        component: "Slider",
        wcag: "2.1.1",
        message: `[Slider:invalid-step] step="${stepProp}" is invalid. step must be > 0 and ≤ (max - min). Falling back to (max - min) / 100.`,
      });
    }

    // Slider:value-out-of-range (4.1.2): value prop
    if (
      isDev &&
      sp.value !== undefined &&
      (sp.value < minProp || sp.value > maxProp)
    ) {
      return withErrorOverlay(element, {
        key: `Slider:value-out-of-range:value:${sp.value}`,
        component: "Slider",
        wcag: "4.1.2",
        message: `[Slider:value-out-of-range] value=${sp.value} is outside [min=${minProp}, max=${maxProp}]. Clamping silently.`,
      });
    }

    // Slider:value-out-of-range (4.1.2): defaultValue prop
    if (
      isDev &&
      sp.defaultValue !== undefined &&
      (sp.defaultValue < minProp || sp.defaultValue > maxProp)
    ) {
      return withErrorOverlay(element, {
        key: `Slider:value-out-of-range:defaultValue:${sp.defaultValue}`,
        component: "Slider",
        wcag: "4.1.2",
        message: `[Slider:value-out-of-range] defaultValue=${sp.defaultValue} is outside [min=${minProp}, max=${maxProp}]. Clamping silently.`,
      });
    }

    return element;
  }

  // ---------------------------------------------------------------------------
  // Render: range
  // ---------------------------------------------------------------------------

  const rp = props as SliderRangeProps;
  const [v0, v1] = rangeValues;

  const t0Min = v0 <= v1 ? minProp : v1;
  const t0Max = v0 <= v1 ? v1 : maxProp;
  const t1Min = v1 <= v0 ? minProp : v0;
  const t1Max = v1 <= v0 ? v0 : maxProp;

  const loPercent = thumbPercent(v0, minProp, maxProp);
  const hiPercent = thumbPercent(v1, minProp, maxProp);

  const fillStyle =
    orientation === "vertical"
      ? { bottom: `${loPercent}%`, height: `${hiPercent - loPercent}%` }
      : { left: `${loPercent}%`, width: `${hiPercent - loPercent}%` };

  const groupId = `${uid}-group`;

  // Format helpers for range bound labels — last thumb index is 1 for max bound.
  const rangeMinLabel = rootFormatValue ? rootFormatValue(minProp, 0) : String(minProp);
  const rangeMaxLabel = rootFormatValue ? rootFormatValue(maxProp, 1) : String(maxProp);
  const v0Label =
    (rp.thumbs[0].formatValue?.(v0) ?? rootFormatValue?.(v0, 0)) ?? String(v0);
  const v1Label =
    (rp.thumbs[1].formatValue?.(v1) ?? rootFormatValue?.(v1, 1)) ?? String(v1);
  const v0ValueStyle =
    orientation === "vertical"
      ? { bottom: `${thumbPercent(v0, minProp, maxProp)}%` }
      : { left: `${thumbPercent(v0, minProp, maxProp)}%` };
  const v1ValueStyle =
    orientation === "vertical"
      ? { bottom: `${thumbPercent(v1, minProp, maxProp)}%` }
      : { left: `${thumbPercent(v1, minProp, maxProp)}%` };

  const rangeElement = (
    <div
      id={groupId}
      role="group"
      aria-label={rp["aria-label"]}
      aria-labelledby={rp["aria-labelledby"]}
      data-orientation={orientation}
      data-disabled={disabled ? "true" : undefined}
      data-show-values={showValues ? "true" : undefined}
      className={["artui-slider", className].filter(Boolean).join(" ")}
    >
      {showValues && (
        <span aria-hidden="true" className="artui-slider-min">{rangeMinLabel}</span>
      )}
      <div
        ref={trackRef}
        className="artui-slider-track"
        onPointerDown={handleTrackPointerDown}
      >
        <div className="artui-slider-fill" style={fillStyle} />
        {renderThumb(0, v0, t0Min, t0Max, rp.thumbs[0], rp.thumbs[0].formatValue)}
        {renderThumb(1, v1, t1Min, t1Max, rp.thumbs[1], rp.thumbs[1].formatValue)}
        {showValues && (
          <span
            aria-hidden="true"
            className="artui-slider-value"
            style={v0ValueStyle}
          >
            {v0Label}
          </span>
        )}
        {showValues && (
          <span
            aria-hidden="true"
            className="artui-slider-value"
            style={v1ValueStyle}
          >
            {v1Label}
          </span>
        )}
      </div>
      {showValues && (
        <span aria-hidden="true" className="artui-slider-max">{rangeMaxLabel}</span>
      )}
    </div>
  );

  // Slider:invalid-step (2.1.1)
  if (
    isDev &&
    stepProp !== undefined &&
    (stepProp <= 0 || stepProp > maxProp - minProp)
  ) {
    return withErrorOverlay(rangeElement, {
      key: "Slider:invalid-step",
      component: "Slider",
      wcag: "2.1.1",
      message: `[Slider:invalid-step] step="${stepProp}" is invalid. step must be > 0 and ≤ (max - min). Falling back to (max - min) / 100.`,
    });
  }

  // Slider:value-out-of-range (4.1.2): range value prop
  if (isDev && rp.value !== undefined) {
    const vals: readonly number[] = rp.value;
    for (let i = 0; i < vals.length; i++) {
      const v = vals[i] as number;
      if (v < minProp || v > maxProp) {
        return withErrorOverlay(rangeElement, {
          key: `Slider:value-out-of-range:value[${i}]:${v}`,
          component: "Slider",
          wcag: "4.1.2",
          message: `[Slider:value-out-of-range] value[${i}]=${v} is outside [min=${minProp}, max=${maxProp}]. Clamping silently.`,
        });
      }
    }
  }

  // Slider:value-out-of-range (4.1.2): range defaultValue prop
  if (isDev && rp.defaultValue !== undefined) {
    const dvals: readonly number[] = rp.defaultValue;
    for (let i = 0; i < dvals.length; i++) {
      const v = dvals[i] as number;
      if (v < minProp || v > maxProp) {
        return withErrorOverlay(rangeElement, {
          key: `Slider:value-out-of-range:defaultValue[${i}]:${v}`,
          component: "Slider",
          wcag: "4.1.2",
          message: `[Slider:value-out-of-range] defaultValue[${i}]=${v} is outside [min=${minProp}, max=${maxProp}]. Clamping silently.`,
        });
      }
    }
  }

  // Slider:thumb-count-mismatch (4.1.2): JS consumers can bypass the tuple type
  if (isDev && rp.value !== undefined && rp.value.length !== 2) {
    return withErrorOverlay(rangeElement, {
      key: "Slider:thumb-count-mismatch",
      component: "Slider",
      wcag: "4.1.2",
      message: "[Slider:thumb-count-mismatch] Range slider value must have exactly 2 elements.",
    });
  }

  // Slider:range-without-group-name (1.3.1): no label at all
  if (isDev && !rp["aria-label"] && !rp["aria-labelledby"]) {
    return withErrorOverlay(rangeElement, {
      key: "Slider:range-without-group-name",
      component: "Slider",
      wcag: "1.3.1",
      message:
        "[Slider:range-without-group-name] Range slider rendered without aria-label or aria-labelledby. The slider group has no accessible name.",
    });
  }

  // Slider:multi-without-thumb-names (4.1.2)
  if (isDev && rp.thumbs) {
    for (let i = 0; i < 2; i++) {
      const td = rp.thumbs[i] as {
        children?: string;
        "aria-label"?: string;
        "aria-labelledby"?: string;
      };
      if (!td.children && !td["aria-label"] && !td["aria-labelledby"]) {
        return withErrorOverlay(rangeElement, {
          key: `Slider:multi-without-thumb-names:${i}`,
          component: "Slider",
          wcag: "4.1.2",
          message: `[Slider:multi-without-thumb-names] thumbs[${i}] has no accessible name. Add aria-label, aria-labelledby, or children.`,
        });
      }
    }
  }

  return rangeElement;
}
