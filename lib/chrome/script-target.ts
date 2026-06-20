/** Target for `chrome.scripting.executeScript` in a tab or iframe. */
export function scriptTarget(tabId: number, frameId?: number) {
  return frameId != null && frameId > 0
    ? { tabId, frameIds: [frameId] }
    : { tabId };
}
