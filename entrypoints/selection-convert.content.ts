import { defineContentScript } from 'wxt/utils/define-content-script';
import { htmlToMarkdown } from '~/lib/extractor/html-to-markdown';
import type { Preset } from '~/types/preset';

export default defineContentScript({
  registration: 'runtime',
  world: 'ISOLATED',
  main() {
    (
      globalThis as typeof globalThis & {
        __webtomd_convertHtml?: (html: string, opts: Preset) => string;
      }
    ).__webtomd_convertHtml = htmlToMarkdown;
    return true;
  },
});
