import type { ReactElement } from "react";

const isDev =
  typeof process !== "undefined" && process.env.NODE_ENV !== "production";

const reported = new Set<string>();

interface DevOverlayOptions {
  /** Stable key for de-duplicating the console.error call. */
  key: string;
  /** Component name shown in the error prefix, e.g. "Image". */
  component: string;
  /** Optional WCAG criterion, e.g. "1.1.1". */
  wcag?: string;
  /** Human-readable description of what went wrong. */
  message: string;
}

/**
 * Wraps `element` in a red full-coverage overlay and emits a console.error.
 *
 * No-op in production. In development, logs once per `key` then returns the
 * element wrapped in a positioned <span> with a red overlay on top.
 * The overlay uses aria-hidden and pointerEvents:none so it does not affect
 * the accessibility tree or interaction.
 */
export function withErrorOverlay(
  element: ReactElement,
  { key, component, wcag, message }: DevOverlayOptions,
): ReactElement {
  if (!isDev) return element;

  if (!reported.has(key)) {
    reported.add(key);
    const wcagSuffix = wcag ? ` [WCAG ${wcag}]` : "";
    console.error(`[artui] <${component}>${wcagSuffix}: ${message}`);
  }

  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      {element}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "#d62828",
          pointerEvents: "none",
        }}
      />
    </span>
  );
}

/** Reset the de-duplication cache. Test-only. */
export function __resetDevOverlayCache(): void {
  reported.clear();
}
