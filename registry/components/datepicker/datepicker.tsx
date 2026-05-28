import {
  type ChangeEvent,
  type KeyboardEvent,
  type ReactElement,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import { type AccessibleText } from "../../lib/a11y-types";
import { withErrorOverlay } from "../../lib/dev-overlay";

import "./datepicker.css";

// ---------------------------------------------------------------------------
// Label prop — exactly one source required; combinations are compile errors
// ---------------------------------------------------------------------------

type DatepickerLabelProps =
  | { label: AccessibleText; "aria-label"?: never; "aria-labelledby"?: never }
  | { label?: never; "aria-label": AccessibleText; "aria-labelledby"?: never }
  | { label?: never; "aria-label"?: never; "aria-labelledby": string };

type DatepickerBaseProps = {
  value: Date | null;
  onChange: (next: Date | null) => void;
  /** BCP-47 locale tag. Defaults to navigator.language. */
  locale?: string;
  min?: Date;
  max?: Date;
  isDateDisabled?: (date: Date) => boolean;
  /** External validation error shown below the input and wired via aria-describedby. */
  error?: string;
  required?: boolean;
};

export type DatepickerProps = DatepickerBaseProps & DatepickerLabelProps;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function addDays(d: Date, n: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  return next;
}

function addMonths(d: Date, n: number): Date {
  const next = new Date(d);
  const targetMonth = next.getMonth() + n;
  next.setMonth(targetMonth);
  // Clamp to the last day of the new month when the day overflows
  // (e.g. Jan 31 + 1 month → Feb 28, not Mar 2).
  if (next.getMonth() !== ((targetMonth % 12) + 12) % 12) {
    next.setDate(0);
  }
  return next;
}

function clampToMonth(d: Date, month: Date): Date {
  const first = startOfMonth(month);
  const last = endOfMonth(month);
  if (d < first) return first;
  if (d > last) return last;
  return d;
}

/** Week start day: 0=Sunday, 1=Monday. Falls back to Monday for locales without Intl.Locale.getWeekInfo. */
function getWeekStartDay(locale: string): 0 | 1 {
  try {
    const info = (
      new Intl.Locale(locale) as { getWeekInfo?: () => { firstDay?: number } }
    ).getWeekInfo?.();
    if (info && info.firstDay === 7) return 0; // Sunday
    return 1; // Monday for most of the world including nl-BE
  } catch {
    return 1;
  }
}

/** Locale-aware input format hint: returns "DD/MM/YYYY", "MM/DD/YYYY", or "YYYY-MM-DD". */
function getDateFormat(locale: string): string {
  const parts = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(new Date(2026, 0, 31));

  const order = parts
    .filter((p) => p.type === "day" || p.type === "month" || p.type === "year")
    .map((p) => p.type);

  if (order[0] === "year") return "YYYY-MM-DD";
  if (order[0] === "month") return "MM/DD/YYYY";
  return "DD/MM/YYYY";
}

/** Parse a user-typed string according to the locale format. Returns Date or null. */
function parseInputValue(raw: string, locale: string): Date | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const fmt = getDateFormat(locale);
  let year: number, month: number, day: number;

  const parts = trimmed.split(/[-/]/).map(Number);
  if (fmt === "YYYY-MM-DD") {
    year = parts[0] ?? NaN;
    month = parts[1] ?? NaN;
    day = parts[2] ?? NaN;
  } else if (fmt === "MM/DD/YYYY") {
    month = parts[0] ?? NaN;
    day = parts[1] ?? NaN;
    year = parts[2] ?? NaN;
  } else {
    // DD/MM/YYYY
    day = parts[0] ?? NaN;
    month = parts[1] ?? NaN;
    year = parts[2] ?? NaN;
  }

  if (!year || !month || !day || isNaN(year) || isNaN(month) || isNaN(day))
    return null;
  if (month < 1 || month > 12) return null;
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  )
    return null;

  return date;
}

/** Format a Date for display in the text input. */
function formatDateForInput(date: Date, locale: string): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const fmt = getDateFormat(locale);
  if (fmt === "YYYY-MM-DD") return `${y}-${m}-${d}`;
  if (fmt === "MM/DD/YYYY") return `${m}/${d}/${y}`;
  return `${d}/${m}/${y}`;
}

type CalendarCell = { date: Date; overflow: boolean };

/** Build a 6-row × 7-col grid of dates for the calendar, filling overflow slots with
 *  dates from the previous / next month so every cell has a real date. */
function buildCalendarGrid(month: Date, weekStart: 0 | 1): CalendarCell[][] {
  const first = startOfMonth(month);
  const last = endOfMonth(month);
  const startOffset = (first.getDay() - weekStart + 7) % 7;

  const cells: CalendarCell[] = [];

  for (let i = 0; i < startOffset; i++) {
    cells.push({
      date: new Date(first.getFullYear(), first.getMonth(), i - startOffset + 1),
      overflow: true,
    });
  }

  for (let d = 1; d <= last.getDate(); d++) {
    cells.push({ date: new Date(month.getFullYear(), month.getMonth(), d), overflow: false });
  }

  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    cells.push({
      date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + nextDay++),
      overflow: true,
    });
  }

  const rows: CalendarCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}

/** Strip non-digit characters and cap at 8 digits (all date formats need exactly 8). */
function toDigits(s: string): string {
  return s.replace(/\D/g, "").slice(0, 8);
}

/** Build a masked display string from raw digits, auto-inserting the locale separator. */
function applyMask(digits: string, fmt: string): string {
  const sep = fmt.includes("-") ? "-" : "/";
  const lengths = fmt.split(sep).map((p) => p.length);
  let result = "";
  let pos = 0;
  for (let i = 0; i < lengths.length; i++) {
    const segLen = lengths[i] ?? 0;
    const seg = digits.slice(pos, pos + segLen);
    result += seg;
    pos += segLen;
    if (i < lengths.length - 1 && seg.length === segLen) result += sep;
  }
  return result;
}

/** Returns the position in `masked` where the digit at `digitIndex` starts. */
function maskCursorForDigitIndex(digitIndex: number, masked: string, sep: string): number {
  let count = 0;
  for (let i = 0; i < masked.length; i++) {
    if (masked[i] !== sep) {
      if (count === digitIndex) return i;
      count++;
    }
  }
  return masked.length;
}

/** Validate a BCP-47 locale string. Returns true if valid. */
function isValidLocale(locale: string): boolean {
  try {
    new Intl.Locale(locale);
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Datepicker(props: DatepickerProps): ReactElement {
  const {
    value,
    onChange,
    locale: localeProp,
    min,
    max,
    isDateDisabled,
    error: externalError,
    required,
    ...labelRest
  } = props;

  // Resolve locale — fall back to navigator.language (or 'en' in SSR)
  const resolvedLocale = useMemo(() => {
    const candidate =
      localeProp ??
      (typeof navigator !== "undefined" ? navigator.language : "en");
    return isValidLocale(candidate) ? candidate : "en";
  }, [localeProp]);

  const weekStart = useMemo(
    () => getWeekStartDay(resolvedLocale),
    [resolvedLocale],
  );

  // IDs for ARIA wiring
  const uid = useId();
  const inputId = `${uid}-input`;
  const errorId = `${uid}-error`;
  const headingId = `${uid}-heading`;
  const liveRegionId = `${uid}-live`;

  // Refs
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pendingCursor = useRef<number | null>(null);

  // State
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(() =>
    value ? formatDateForInput(value, resolvedLocale) : "",
  );
  const [inputError, setInputError] = useState<string | null>(null);
  const [displayMonth, setDisplayMonth] = useState<Date>(() =>
    value ? startOfMonth(value) : startOfMonth(new Date()),
  );
  const [focusedDate, setFocusedDate] = useState<Date>(
    () => value ?? new Date(),
  );
  const [liveText, setLiveText] = useState("");
  const [digitStr, setDigitStr] = useState<string>(() =>
    value ? toDigits(formatDateForInput(value, resolvedLocale)) : "",
  );

  // Sync input display (and digit string) when value changes externally
  useEffect(() => {
    if (value) {
      const formatted = formatDateForInput(value, resolvedLocale);
      setInputValue(formatted);
      setDigitStr(toDigits(formatted));
    } else {
      setInputValue("");
      setDigitStr("");
    }
  }, [value, resolvedLocale]);

  // Restore cursor position after backspace re-renders the masked input
  useEffect(() => {
    if (pendingCursor.current !== null && inputRef.current) {
      inputRef.current.setSelectionRange(pendingCursor.current, pendingCursor.current);
      pendingCursor.current = null;
    }
  }, [inputValue]);

  // ---------------------------------------------------------------------------
  // Calendar helpers
  // ---------------------------------------------------------------------------

  const calendarGrid = useMemo(
    () => buildCalendarGrid(displayMonth, weekStart),
    [displayMonth, weekStart],
  );

  const headingText = useMemo(
    () =>
      new Intl.DateTimeFormat(resolvedLocale, {
        month: "long",
        year: "numeric",
      }).format(displayMonth),
    [displayMonth, resolvedLocale],
  );

  function isCellDisabled(date: Date): boolean {
    if (min && date < startOfDay(min)) return true;
    if (max && date > startOfDay(max)) return true;
    if (isDateDisabled?.(date)) return true;
    return false;
  }

  const prevMonthLabel = useMemo(() => {
    const prev = addMonths(displayMonth, -1);
    return `Previous month, ${new Intl.DateTimeFormat(resolvedLocale, { month: "long", year: "numeric" }).format(prev)}`;
  }, [displayMonth, resolvedLocale]);

  const nextMonthLabel = useMemo(() => {
    const next = addMonths(displayMonth, 1);
    return `Next month, ${new Intl.DateTimeFormat(resolvedLocale, { month: "long", year: "numeric" }).format(next)}`;
  }, [displayMonth, resolvedLocale]);

  // Weekday column headers
  const weekdayHeaders = useMemo(() => {
    const headers = [];
    for (let i = 0; i < 7; i++) {
      const dayIndex = (weekStart + i) % 7;
      const date = new Date(2026, 0, 4 + dayIndex); // Jan 4 2026 is a Sunday (0)
      const short = new Intl.DateTimeFormat(resolvedLocale, {
        weekday: "short",
      }).format(date);
      const long = new Intl.DateTimeFormat(resolvedLocale, {
        weekday: "long",
      }).format(date);
      headers.push({ short, long });
    }
    return headers;
  }, [weekStart, resolvedLocale]);

  // ---------------------------------------------------------------------------
  // Open / close
  // ---------------------------------------------------------------------------

  function open(): void {
    const initial = value ?? new Date();
    setDisplayMonth(startOfMonth(initial));
    setFocusedDate(initial);
    setIsOpen(true);
  }

  function close(): void {
    dialogRef.current?.close();
  }

  // After React mounts the <dialog>, call showModal() and position it below the input.
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;
    const dialog = dialogRef.current;
    if (!dialog.open) {
      dialog.showModal();
    }

    const reposition = () => {
      if (!inputRef.current) return;
      const rect = inputRef.current.getBoundingClientRect();
      dialog.style.margin = "0";

      // Clamp horizontally so the dialog never overflows the right edge.
      const desiredLeft = rect.left;
      const left = Math.max(
        4,
        Math.min(desiredLeft, window.innerWidth - dialog.offsetWidth - 4),
      );

      // Flip above the input when the dialog would overflow the bottom AND there
      // is enough room above. Fall back to below and clamp to at least 4px.
      let top = rect.bottom + 4;
      if (
        top + dialog.offsetHeight > window.innerHeight &&
        rect.top - dialog.offsetHeight - 4 >= 0
      ) {
        top = rect.top - dialog.offsetHeight - 4;
      }
      top = Math.max(4, top);

      dialog.style.top = `${top}px`;
      dialog.style.left = `${left}px`;
    };

    reposition();
    window.addEventListener("scroll", reposition, { capture: true, passive: true });
    window.addEventListener("resize", reposition, { passive: true });
    return () => {
      window.removeEventListener("scroll", reposition, { capture: true });
      window.removeEventListener("resize", reposition);
      if (dialog.open) {
        dialog.close();
      }
    };
  }, [isOpen]);

  // Sync React state when the native dialog closes (handles both our close() and Escape via cancel).
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;
    const dialog = dialogRef.current;
    const sync = () => {
      setIsOpen(false);
      triggerRef.current?.focus();
    };
    const onBackdropClick = (e: MouseEvent) => {
      if (e.target === dialog) dialog.close();
    };
    dialog.addEventListener("close", sync);
    dialog.addEventListener("click", onBackdropClick);
    return () => {
      dialog.removeEventListener("close", sync);
      dialog.removeEventListener("click", onBackdropClick);
    };
  }, [isOpen]);

  // Move focus to the active day cell when the calendar opens or the focused date changes.
  useEffect(() => {
    if (isOpen) {
      dialogRef.current
        ?.querySelector<HTMLElement>('[data-focused-day="true"]')
        ?.focus();
    }
  }, [isOpen, focusedDate]);

  // Update live region on month change
  useEffect(() => {
    if (isOpen) {
      setLiveText(headingText);
    }
  }, [headingText, isOpen]);

  // ---------------------------------------------------------------------------
  // Input handler (masked: digits + separators; mask is re-applied on every change)
  // ---------------------------------------------------------------------------
  //
  // Driven by `change`/`input` events rather than `keydown` so voice-control
  // dictation (Dragon, Windows Speech Recognition), IME composition, browser
  // autofill, and paste all work — they all set value but never synthesise
  // keydown.

  function handleInputChange(e: ChangeEvent<HTMLInputElement>): void {
    const fmt = getDateFormat(resolvedLocale);
    const sep = fmt.includes("-") ? "-" : "/";
    const raw = e.target.value;
    const caret = e.target.selectionStart ?? raw.length;

    // Count how many digits appear before the caret in the user's raw input —
    // that's where we want the caret to land in the masked result.
    let digitsBeforeCaret = 0;
    for (let i = 0; i < caret && i < raw.length; i++) {
      if (raw[i] && /\d/.test(raw[i] as string)) digitsBeforeCaret++;
    }

    const newDigits = toDigits(raw);
    const masked = applyMask(newDigits, fmt);

    setDigitStr(newDigits);
    setInputValue(masked);
    pendingCursor.current = maskCursorForDigitIndex(
      digitsBeforeCaret,
      masked,
      sep,
    );

    if (newDigits.length === 0) {
      setInputError(null);
      onChange(null);
      return;
    }

    if (newDigits.length === 8) {
      const parsed = parseInputValue(masked, resolvedLocale);
      if (parsed) {
        setInputError(null);
        onChange(parsed);
        setDisplayMonth(startOfMonth(parsed));
      } else {
        setInputError(`Enter a valid date in ${fmt} format.`);
      }
    } else {
      setInputError(null);
    }
  }

  function handleInputBlur(): void {
    if (digitStr.length > 0 && digitStr.length < 8) {
      setInputError(
        `Enter a complete date in ${getDateFormat(resolvedLocale)} format.`,
      );
    } else if (digitStr.length === 0) {
      setInputError(null);
    }
  }

  // ---------------------------------------------------------------------------
  // Grid keyboard handler
  // ---------------------------------------------------------------------------

  function handleGridKeyDown(e: KeyboardEvent<HTMLElement>): void {
    const key = e.key;
    if (
      key !== "ArrowLeft" &&
      key !== "ArrowRight" &&
      key !== "ArrowUp" &&
      key !== "ArrowDown" &&
      key !== "Home" &&
      key !== "End" &&
      key !== "PageUp" &&
      key !== "PageDown" &&
      key !== "Enter" &&
      key !== " "
    ) {
      return;
    }

    e.preventDefault();

    let next = focusedDate;
    let newMonth = displayMonth;

    switch (key) {
      case "ArrowRight":
        next = addDays(focusedDate, 1);
        break;
      case "ArrowLeft":
        next = addDays(focusedDate, -1);
        break;
      case "ArrowDown":
        next = addDays(focusedDate, 7);
        break;
      case "ArrowUp":
        next = addDays(focusedDate, -7);
        break;
      case "Home":
        next = startOfMonth(displayMonth);
        break;
      case "End":
        next = endOfMonth(displayMonth);
        break;
      case "PageUp":
        newMonth = addMonths(displayMonth, -1);
        next = clampToMonth(
          new Date(
            newMonth.getFullYear(),
            newMonth.getMonth(),
            focusedDate.getDate(),
          ),
          newMonth,
        );
        break;
      case "PageDown":
        newMonth = addMonths(displayMonth, 1);
        next = clampToMonth(
          new Date(
            newMonth.getFullYear(),
            newMonth.getMonth(),
            focusedDate.getDate(),
          ),
          newMonth,
        );
        break;
      case "Enter":
      case " ":
        if (!isCellDisabled(focusedDate)) {
          onChange(focusedDate);
          const kbFormatted = formatDateForInput(focusedDate, resolvedLocale);
          setInputValue(kbFormatted);
          setDigitStr(toDigits(kbFormatted));
          setInputError(null);
          close();
        }
        return;
    }

    // Cross-month navigation: update displayMonth if needed
    if (
      next.getMonth() !== displayMonth.getMonth() ||
      next.getFullYear() !== displayMonth.getFullYear()
    ) {
      newMonth = startOfMonth(next);
    }

    setDisplayMonth(newMonth);
    setFocusedDate(next);
  }

  // Tab is handled natively by showModal()'s built-in focus trap; we only intercept Escape.
  function handleDialogKeyDown(e: KeyboardEvent<HTMLDialogElement>): void {
    if (e.key === "Escape") {
      e.preventDefault(); // prevent native cancel-then-close; we call close() explicitly
      close();
    }
  }

  // ---------------------------------------------------------------------------
  // Derive label wiring
  // ---------------------------------------------------------------------------

  const {
    label,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
  } = labelRest as {
    label?: string;
    "aria-label"?: string;
    "aria-labelledby"?: string;
  };

  const inputAriaLabel = label ? undefined : ariaLabel;
  const inputAriaLabelledBy = label ? undefined : ariaLabelledBy;

  // ---------------------------------------------------------------------------
  // Runtime violation detection
  // ---------------------------------------------------------------------------

  const runtimeViolation = useMemo((): {
    key: string;
    wcag?: string;
    message: string;
  } | null => {
    if (localeProp && !isValidLocale(localeProp)) {
      return {
        key: `Datepicker:invalid-locale:${localeProp}`,
        message: `locale '${localeProp}' is not a valid BCP-47 tag. Falling back to navigator.language.`,
      };
    }
    return null;
  }, [localeProp]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const today = new Date();

  const activeError = inputError ?? externalError ?? null;

  const element = (
    <div className="artui-datepicker">
      {label && (
        <label htmlFor={inputId} className="artui-dp-label">
          {label}
        </label>
      )}

      <div className="artui-dp-input-row">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          className="artui-dp-input"
          value={inputValue}
          placeholder={getDateFormat(resolvedLocale)}
          aria-label={inputAriaLabel}
          aria-labelledby={inputAriaLabelledBy}
          aria-describedby={errorId}
          required={required}
          aria-required={required || undefined}
          aria-invalid={activeError ? "true" : undefined}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
        />
        <button
          ref={triggerRef}
          type="button"
          className="artui-dp-trigger"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-label="Open date picker"
          onClick={() => (isOpen ? close() : open())}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (isOpen) close(); else open();
            }
          }}
        >
          <svg
            stroke="currentColor"
            fill="none"
            strokeWidth="2"
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M8 2v4"></path>
            <path d="M16 2v4"></path>
            <rect width="18" height="18" x="3" y="4" rx="2"></rect>
            <path d="M3 10h18"></path>
          </svg>
        </button>
      </div>

      <span
        id={errorId}
        className="artui-dp-error"
        role={activeError ? "alert" : undefined}
      >
        {activeError ?? ""}
      </span>

      {/* Always-present live region for screen reader month announcements */}
      <div
        id={liveRegionId}
        aria-live="polite"
        aria-atomic="true"
        className="artui-dp-sr-only"
      >
        {liveText}
      </div>

      {isOpen && (
        <dialog
          ref={dialogRef}
          aria-modal="true"
          aria-labelledby={headingId}
          className="artui-dp-dialog"
          onKeyDown={handleDialogKeyDown}
          onCancel={(e) => e.preventDefault()}
        >
          <div className="artui-dp-dialog-header">
            <button
              type="button"
              className="artui-dp-nav-btn"
              aria-label={prevMonthLabel}
              onClick={() => {
                const prev = addMonths(displayMonth, -1);
                setDisplayMonth(prev);
                setFocusedDate(clampToMonth(focusedDate, prev));
              }}
            >
              <span aria-hidden="true">&#x2039;</span>
            </button>

            <h2 id={headingId} className="artui-dp-heading">
              {headingText}
            </h2>

            <button
              type="button"
              className="artui-dp-nav-btn"
              aria-label={nextMonthLabel}
              onClick={() => {
                const next = addMonths(displayMonth, 1);
                setDisplayMonth(next);
                setFocusedDate(clampToMonth(focusedDate, next));
              }}
            >
              <span aria-hidden="true">&#x203A;</span>
            </button>

            <button
              type="button"
              className="artui-dp-close-btn"
              aria-label="Close"
              onClick={close}
            >
              <span aria-hidden="true">&#x2715;</span>
            </button>
          </div>

          <table role="grid" aria-label={headingText} className="artui-dp-grid">
            <thead>
              <tr role="row">
                {weekdayHeaders.map((h) => (
                  <th
                    key={h.long}
                    role="columnheader"
                    abbr={h.long}
                    scope="col"
                  >
                    {h.short}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {calendarGrid.map((week, wi) => (
                <tr key={wi} role="row">
                  {week.map(({ date, overflow }, di) => {
                    const isSelected = value ? isSameDay(date, value) : false;
                    const isToday = isSameDay(date, today);
                    const isDisabled = isCellDisabled(date);
                    const isFocused = isSameDay(date, focusedDate);

                    return (
                      <td
                        key={di}
                        role="gridcell"
                        className="artui-dp-day-cell"
                        aria-selected={isSelected ? "true" : undefined}
                      >
                        <button
                          type="button"
                          className={`artui-dp-day-btn${overflow ? " artui-dp-day-btn--overflow" : ""}`}
                          tabIndex={isFocused ? 0 : -1}
                          data-focused-day={isFocused ? "true" : undefined}
                          aria-current={isToday ? "date" : undefined}
                          aria-disabled={isDisabled ? "true" : undefined}
                          aria-label={new Intl.DateTimeFormat(resolvedLocale, {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }).format(date)}
                          disabled={isDisabled}
                          onKeyDown={handleGridKeyDown}
                          onClick={() => {
                            if (!isDisabled) {
                              onChange(date);
                              const clickFormatted = formatDateForInput(date, resolvedLocale);
                              setInputValue(clickFormatted);
                              setDigitStr(toDigits(clickFormatted));
                              setInputError(null);
                              if (overflow) setDisplayMonth(startOfMonth(date));
                              close();
                            }
                          }}
                          onFocus={() => setFocusedDate(date)}
                        >
                          {date.getDate()}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </dialog>
      )}
    </div>
  );

  if (runtimeViolation) {
    return withErrorOverlay(element, {
      key: runtimeViolation.key,
      component: "Datepicker",
      wcag: runtimeViolation.wcag,
      message: runtimeViolation.message,
    });
  }

  return element;
}
