# WebToMD Privacy Policy

**Last updated:** June 20, 2026

WebToMD is a Chrome extension that converts webpage content to Markdown on your device. This policy explains what data the extension handles and what it does not do.

## Summary

WebToMD does **not** collect, store, transmit, or sell personal data. All extraction and formatting happen locally in your browser. No account is required.

## Data we do not collect

- No analytics or telemetry
- No crash reporting to third parties
- No usage tracking
- No advertising identifiers
- No server-side storage of page content

## Data processed locally

When you use WebToMD, the extension processes content only after an explicit action by you:

- **Page Workflow:** clicking the extension icon on the active tab
- **Selection Workflow:** right-clicking selected text and choosing “Copy Selection as MD”

In those cases, the extension may read the active tab’s DOM to extract main content or your selection, convert it to Markdown, estimate token count, and write the result to your clipboard. This processing stays on your device.

## Permissions

WebToMD requests only the permissions needed for on-demand extraction:

| Permission       | Why                                                                                                 |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| `activeTab`      | Access the current tab only after you click the icon or use the context menu                        |
| `scripting`      | Inject the extraction script into the active tab on your request                                    |
| `contextMenus`   | Add “Copy Selection as MD” to the right-click menu                                                  |
| `storage`        | Save your settings (default Preset, frontmatter toggle, onboarding state) via `chrome.storage.sync` |
| `clipboardWrite` | Copy formatted Markdown to your clipboard                                                           |

WebToMD does **not** request host permissions (`<all_urls>` or per-site access). It cannot read pages without your explicit action on the active tab.

## Settings sync

If you are signed into Chrome and have sync enabled, your extension settings may sync across your devices through Google’s Chrome sync infrastructure. WebToMD does not operate a separate backend for settings.

## Third parties

WebToMD does not send page content to third-party services. The extension bundles open-source libraries (`@mozilla/readability`, `turndown`) that run entirely client-side.

## Children

WebToMD is not directed at children under 13, and we do not knowingly collect information from children.

## Changes

We may update this policy when the extension changes. The “Last updated” date at the top will reflect the latest revision.

## Contact

Questions about this policy: open an issue at [github.com/ramaaudra/web-to-markdown](https://github.com/ramaaudra/web-to-markdown).
