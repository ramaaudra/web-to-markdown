/**
 * Reads the current DOM selection as HTML inside the tab's isolated world.
 *
 * Must stay self-contained — passed to `chrome.scripting.executeScript({ func })`,
 * which only serializes this one function into the page.
 */
export function readSelectionHtmlFromPage(): { html: string } | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  if (range.collapsed) return null;
  const container = document.createElement('div');
  container.appendChild(range.cloneContents());
  return { html: container.innerHTML };
}
