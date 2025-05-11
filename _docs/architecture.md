# Miru - Technical Architecture

## 1. System Overview

Miru ("To See" in Japanese) is a code-to-Figma design validation tool that enables real-time comparison between implemented UI and Figma designs. The system provides instant visual regression testing directly in the browser, helping developers, designers, and QA engineers identify design fidelity issues early in the development process.

## 2. High-Level Architecture

```
flowchart LR
    subgraph Browser Extension (MV3)
        A[DevTools UI] -->|user action| B[Service Worker]
        B --> C[captureVisibleTab → build.png]
        B --> D[Figma Fetch → design.png]
        C --> E(Diff Worker – pixelmatch)
        D --> E
        E -->|diff.png + metrics| A
    end
```

The architecture follows a modern browser extension model with clear separation of concerns:

1. **DevTools UI** - User-facing interface within browser developer tools
2. **Service Worker** - Main extension controller, manages capture and fetch operations
3. **Screenshot Capture** - Takes snapshots of the current application state
4. **Figma Integration** - Fetches corresponding design frames from Figma
5. **Diff Engine** - Compares design and implementation pixel-by-pixel

## 3. Technical Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Core Language | TypeScript | Strong typing, IDE integration, zero-runtime overhead |
| Build System | tsup/ESBuild | Fast bundling with TypeScript support |
| Screenshot | chrome.tabs.captureVisibleTab + html2canvas (fallback) | No external dependencies, instant capture |
| Design Fetch | Figma Render API via fetch | Simple PNG retrieval with scale parameters |
| Image Diff | pixelmatch (JS) + pngjs | WebWorker compatible, zero native dependencies |
| UI Framework | Lit + vanilla TS | Lightweight component system |
| Overlay Tech | CSS mix-blend-mode | Efficient visual comparison technique |
| Shared Logic | @miru/core monorepo package | Reusable across CLI & extension |

## 4. Component Breakdown

### 4.1 Browser Extension (MV3)

- **Background Service Worker**
  - Lifecycle management
  - Message handling between UI and content scripts
  - API request coordination

- **Content Scripts**
  - DOM manipulation for overlay visualization
  - Viewport measurement
  - Element masking

- **DevTools Panel**
  - Figma frame selection
  - Comparison controls
  - Results visualization
  - Export functionality

### 4.2 Core Diff Engine

- **WebWorker-based Processing**
  - Isolation from main thread
  - Performance optimization with chunked processing
  - Handles large resolution comparisons

- **Pixel Matching Algorithm**
  - Configurable tolerance thresholds
  - Perceptual color difference calculation
  - Mask-aware comparison

## 5. Data Flow

1. User navigates to web page and activates Miru
2. User selects Figma frame for comparison
3. Extension captures current viewport
4. Extension requests design frame from Figma API
5. Images sent to Diff Worker for comparison
6. Results rendered in overlay UI with metrics
7. Diff report generated for export

## 6. Performance Considerations

| Metric | Target |
|--------|--------|
| Capture+diff 1080p page | < 1.5s on M1 MacBook |
| Extension bundle size | < 250KB gzipped |
| CPU on diff worker | Yield to main thread every 50ms |

Performance optimizations include:
- WebWorker processing to avoid UI thread blocking
- Efficient image comparison algorithms
- Incremental processing of large images
- Local caching of Figma assets

## 7. Security & Privacy

- Figma Personal Access Token stored in Chrome's encrypted storage (≥v124)
- No tokens or credentials transmitted beyond their intended destinations
- API interactions limited to essential endpoints
- No unsafe-eval; strict Content Security Policy enforced
- All operations except Figma fetch run completely offline

## 8. Future Architecture Evolution

As outlined in the roadmap, the architecture will evolve to include:

1. **CLI/CI Integration**
   - Headless capture via Playwright
   - Integration with CI/CD pipelines
   - Shared core logic with extension

2. **Component-Level Analysis**
   - DOM-aware element isolation
   - Targeted comparison of specific components
   - Deeper design token validation

3. **History & Versioning**
   - Baseline history tracking
   - Design version integration with Figma file versioning
   - Change tracking and regression identification 