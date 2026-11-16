'use client';

import { useEffect } from 'react';

/**
 * Loads Gesso's custom elements (<art-header>, <art-button>, …) in the browser.
 * Their modules touch `customElements` as soon as they load, so they can't run on the server;
 * the markup is server-rendered as plain HTML and the elements upgrade when this arrives.
 */
export function GessoElements() {
  useEffect(() => {
    import('@vandervennet/gesso');
  }, []);
  return null;
}
