import { describe, it, expect } from 'vitest';
import { readSelectionHtmlFromPage } from '~/lib/extractor/read-selection-html';

describe('readSelectionHtmlFromPage', () => {
  it('is self-contained for executeScript serialization', () => {
    const source = readSelectionHtmlFromPage.toString();
    expect(source).not.toMatch(/\bimport\b/);
    expect(source).not.toMatch(/\brequire\b/);
  });
});
