# WebToMD

Chrome extension that extracts the main content of a webpage (or a text selection) and copies it as token-efficient Markdown — optimized for pasting into AI agent contexts.

## Language

**Web Clip**:
The unit of output — a Markdown string representing the main content of a webpage (or selection), optionally preceded by YAML frontmatter.
_Avoid_: snippet, excerpt, capture

**Main Content**:
The article body of a webpage, excluding navigation, sidebars, footers, ads, cookie banners, related-article widgets, and other chrome.
_Avoid_: body text, page content

**Selection Clip**:
A Web Clip produced from the user's text selection on a page.
_Avoid_: highlight clip

**Page Clip**:
A Web Clip produced from the page's Main Content.
_Avoid_: full-page clip, full-page extract

**Preset**:
A named bundle of formatting options that determines what is included in a Web Clip.
_Avoid_: profile, template, mode

**Frontmatter**:
A YAML block prepended to a Web Clip's Markdown body, containing structured metadata so AI agents can cite the source.
_Avoid_: header, metadata block

**Token Count**:
An estimate of how many tokens the Web Clip will consume in an AI context, displayed in the popup to help users choose a Preset.
_Avoid_: size, length
