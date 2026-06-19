// Page extraction script — runs in the active tab's MAIN world on demand.
// Invoked by `chrome.scripting.executeScript({ files, world: 'MAIN' })` from
// the popup; returns a serialized Readability Article to the caller.
//
// This is the page-context counterpart to `lib/extractor/`. The popup reads
// the result, converts it to Markdown in the popup context, and writes it to
// the clipboard. We split extraction across the two worlds so Readability can
// see the live `document` while Turndown (and our clip type) stays in the
// extension context where it has access to clipboard + storage APIs.

import { defineContentScript } from 'wxt/utils/define-content-script';
import { Readability } from '@mozilla/readability';

type ReadabilityArticle = NonNullable<ReturnType<Readability['parse']>>;

export default defineContentScript({
  registration: 'runtime',
  world: 'ISOLATED',
  main(): ReadabilityArticle | null {
    const documentClone = document.cloneNode(true) as Document;
    const reader = new Readability(documentClone, {
      charThreshold: 200,
    });
    return reader.parse();
  },
});
