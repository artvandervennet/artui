/**
 * Keyboard navigation hooks. Used by Datepicker, Multiselect, Accordion —
 * the components where keyboard navigation goes beyond plain Tab.
 */

import { useEffect, useRef } from 'react';

export type KeyHandler = (event: KeyboardEvent) => void;

export interface KeyMap {
  ArrowUp?: KeyHandler;
  ArrowDown?: KeyHandler;
  ArrowLeft?: KeyHandler;
  ArrowRight?: KeyHandler;
  Home?: KeyHandler;
  End?: KeyHandler;
  PageUp?: KeyHandler;
  PageDown?: KeyHandler;
  Escape?: KeyHandler;
  Enter?: KeyHandler;
  Space?: KeyHandler;
}

/**
 * Attach a keymap to an element (or document if no ref is given). Handlers
 * fire on keydown and the default action is preserved unless the handler
 * itself calls preventDefault.
 */
export function useKeyboard(
  keyMap: KeyMap,
  target?: React.RefObject<HTMLElement | null>,
): void {
  const latest = useRef(keyMap);
  latest.current = keyMap;

  useEffect(() => {
    const el: HTMLElement | Document = target?.current ?? document;

    function onKeydown(event: Event): void {
      const k = event as KeyboardEvent;
      const map = latest.current;
      const handler =
        k.key === ' '
          ? map.Space
          : map[k.key as keyof KeyMap];
      handler?.(k);
    }

    el.addEventListener('keydown', onKeydown);
    return () => el.removeEventListener('keydown', onKeydown);
  }, [target]);
}
