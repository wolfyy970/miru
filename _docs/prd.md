Miru – Product Requirements Document

Project: Miru
Description: Japanese for 'To See' - Code to Figma design validation
Last updated: 10 May 2025
Author: KC Wolff-Ingham & ChatGPT

⸻

1. Purpose & Background

Modern teams ship UI at high velocity, but verifying that implementation matches Figma comps is still manual, subjective, and slow. Existing visual-regression SaaS products (Percy, Chromatic) test code vs. last approved screenshot, not code vs. design file. SpotCheck fills that gap with an in-browser, one-click "spec-vs-build" comparison tool that front-end devs, designers, and QA engineers can use during everyday work.

⸻

2. Problem Statement

Design fidelity defects—incorrect spacing, colour, typography—routinely escape to production because:
	•	Designers rarely see the actual build until late QA.
	•	Pixel-perfect checks in CI catch issues after code review, slowing iteration.
	•	Visual QA tooling often mis-compares due to dynamic data or responsive layouts.

SpotCheck should surface divergence immediately, while the dev is still on the page, with the option to push those same checks into CI for release blocking.

⸻

3. Goals & Non-Goals

#	Goal (v1)	Success Metric
G1	One-click capture of current tab & chosen Figma frame, side-by-side diff overlay	≤ 5 s end-to-end on 1440 × 900 page
G2	Numeric "fidelity score" (% pixels matched) and highlighted diff heat-map	90 % of real visual issues flagged in pilot test
NG1	Out of scope v1: accessibility, performance, or semantic DOM checks	—


⸻

4. Personas & Use Cases
	•	Dana Dev (Front-End): tweaks CSS in DevTools, clicks SpotCheck to verify the fix before commit.
	•	Quinn QA: runs through exploratory test script, attaches diff overlay to Jira ticket.
	•	Sam Designer: opens staging URL, overlays design to negotiate trade-offs with dev.
	•	CI Bot (future): blocks PR when fidelity < threshold.

⸻

5. User Experience (MVP Flow)
	1.	Install SpotCheck Chrome/Edge extension.
	2.	Navigate to any page or Storybook story.
	3.	Click toolbar icon (or open DevTools → SpotCheck panel).
	4.	Paste Figma file URL / choose recent frame (autocomplete via Figma API).
	5.	Hit Compare → overlay appears with scrub slider (Design ↔ Build ↔ Diff) + score.
	6.	Save export (PNG diff + JSON) or file issue directly (future integration).

⸻

6. Functional Requirements

ID	Requirement
F1	Support static frames and components up to 4096 × 4096 px rendered at device-pixel-ratio.
F2	Store Figma Personal-Access Token securely (Chrome ≥ 124 encrypted storage).
F3	Allow tolerance threshold slider (0 – 10 % mismatch).
F4	Mask elements by selector or region (JSON config) to ignore dynamic areas.
F5	Export report: design.png, build.png, diff.png, report.json.
F6	Extension must run completely offline except Figma fetch.


⸻

7. Technical Solution Overview

7.1 High-Level Architecture

flowchart LR
    subgraph Browser Extension (MV3)
        A[DevTools UI] -->|user action| B[Service Worker]
        B --> C[captureVisibleTab → build.png]
        B --> D[Figma Fetch → design.png]
        C --> E(Diff Worker – pixelmatch)
        D --> E
        E -->|diff.png + metrics| A
    end

7.2 Key Technology Choices

Area	Decision	Rationale
Language / Build	TypeScript + tsup/ESBuild	Strong typing, tight editor integration, zero-runtime overhead
Screenshot	chrome.tabs.captureVisibleTab (static) & scrolling/stitch fallback using html2canvas	No external binaries, instant capture
Design fetch	Figma Render API (/images) via fetch	Simple PNG, respects scale param
Image diff	pixelmatch (pure JS) + pngjs	Runs in WebWorker, zero native deps
Overlay UI	Lit (TypeScript) + vanilla TS; slider uses CSS mix-blend-mode	Lightweight, fast
Shared core	@spotcheck/core monorepo package (TypeScript)	Re-used by CLI & extension

7.3 Performance Targets   Performance Targets

Metric	Target
Capture+diff 1080p page	< 1.5 s on M1 MacBook
Extension bundle size	< 250 KB gzipped
CPU on diff worker	Yield to main thread every 50 ms

7.4 Security & Privacy
	•	Token encrypted in browser storage; never sent to servers except Figma.
	•	No unsafe-eval; strict CSP enforced.

⸻

8. MVP Roadmap & Evolution

Phase	Features	ETA
0.1 α	Toolbar button, manual frame ID, pixel diff, overlay slider	3 wks
0.2 β	Frame autocomplete, mask config, export JSON/PNG	+2 wks
0.3	DevTools panel, ignore dynamic selectors	+3 wks
0.4	CLI/CI module (Playwright capture) sharing core logic	+4 wks
1.0	Component-scope cropping, baseline history, token/DOM diff	Q4 2025

Future Enhancements (Post 1.0):
    • Implement client-side caching (e.g., IndexedDB) for fetched Figma images to optimize performance and reduce API calls.


⸻

9. Metrics & KPIs
	•	Adoption: ≥ 70 % of front-end team install extension within first sprint.
	•	Turnaround: Average defect found → fixed time drops > 30 % vs baseline.
	•	Noise ratio: < 10 % of flagged diffs are "false positives" in pilot logs.
	•	Design Satisfaction: Mean designer survey ≥ 4/5 on "confidence in spec adherence."

⸻

10. Risks & Mitigations

Risk	Impact	Mitigation
Diff noise from dynamic data	Dev frustration	Mask & root-element crop (v0.2)
Figma API rate limits	Block testers	Warn user (MVP); Future: Cache PNG per frame/day (IndexedDB)
Huge artboards	Memory blow-up	Warn & downscale or segment diff


⸻

11. Open Questions
	1.	Where to store shared ignore-mask config (repo JSON vs per-user)?
	2.	How to version "approved" baseline frames when design updates? (Use Figma file version hash?)