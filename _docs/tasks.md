# Miru - Task Plan

This document outlines the tasks to build the Miru extension based on the PRD and Architecture documents.

---

*   [x] **Task 1: Project Setup & Core Dependencies**
    *   **Risk:** Low
    *   **Implementation:**
        The AI assistant will:
        1.  Create `package.json` with project info (name: "miru", version: "0.1.0"), and scripts:
            *   `"build": "tsup"`
            *   `"dev": "tsup --watch"`
        2.  Install dependencies using npm:
            *   Dev Dependencies: `typescript`, `tsup`, `esbuild`
            *   Dependencies: `pixelmatch`, `pngjs`, `lit`
        3.  Initialize `tsconfig.json` (`npx tsc --init`) with settings:
            *   `"target": "esnext"`
            *   `"module": "esnext"`
            *   `"moduleResolution": "node"`
            *   `"esModuleInterop": true`
            *   `"strict": true`
            *   `"skipLibCheck": true`
            *   `"lib": ["dom", "esnext"]`
            *   `"outDir": "./dist"` (though tsup handles output)
            *   `"rootDir": "./src"`
        4.  Create `tsup.config.ts` to:
            *   Bundle `client/src/service-worker.ts`, `client/src/content-script.ts`, `client/src/popup.ts`.
            *   Entry points: `{'service-worker': 'client/src/service-worker.ts', 'content-script': 'client/src/content-script.ts', 'popup': 'client/src/popup.ts'}`
            *   Format: `['esm']`
            *   Output directory: `dist/`
            *   Enable shims for `__dirname`, `__filename` if needed by dependencies (likely not for these).
            *   Copy static assets from `client/public/` to `dist/` (using a custom `onSuccess` hook or separate copy script).
        5.  Create `client/public/manifest.json`:
            ```json
            {
              "manifest_version": 3,
              "name": "Miru",
              "version": "0.1.0",
              "description": "Code to Figma design validation.",
              "permissions": ["activeTab", "scripting", "storage", "tabs"],
              "action": {
                "default_popup": "popup.html",
                "default_icon": {
                  "16": "icons/icon16.png",
                  "48": "icons/icon48.png",
                  "128": "icons/icon128.png"
                }
              },
              "background": {
                "service_worker": "service-worker.js",
                "type": "module"
              },
              "icons": {
                "16": "icons/icon16.png",
                "48": "icons/icon48.png",
                "128": "icons/icon128.png"
              }
            }
            ```
        6.  Create directory structure:
            *   `client/src/` (for .ts files)
            *   `client/public/` (for static assets like `manifest.json`, `popup.html`, `icons/`)
            *   `client/public/icons/` (with placeholder icon16.png, icon48.png, icon128.png)
            *   `dist/` (will be created by tsup, add to `.gitignore`)
        7. Create a basic `client/public/popup.html`.
        8. Create placeholder files: `client/src/service-worker.ts`, `client/src/content-script.ts`, `client/src/popup.ts`.
        9. Create `.gitignore` file including `node_modules/` and `dist/`.
    *   **VERIFICATION REQUIRED:**
        The user will:
        1.  Run `npm install` in the terminal. Confirm it completes without errors.
        2.  Run `npm run build` in the terminal. Confirm it completes without errors and the `dist/` directory is created containing `manifest.json`, `popup.html`, `service-worker.js`, `popup.js`, and `icons/`.
        3.  Open Chrome, go to `chrome://extensions`, enable "Developer mode".
        4.  Click "Load unpacked" and select the `dist/` directory.
        5.  Confirm the Miru extension loads without errors on the `chrome://extensions` page.
    *   **Mark Complete:** (AI will update this to `* [x]` after user confirmation)
    *   **Commit & Push (On Success):**
        The AI assistant will propose:
        ```bash
        git add . && git commit -m "Refactor: Complete Step 1 - Project Setup & Core Dependencies" && git push
        ```
    *   **Proceed Confirmation:** (AI will ask: "Are you ready to proceed to Task 2?")

---

*   [ ] **Task 2: Basic Extension UI - Toolbar Button & Placeholder Panel**
    *   **Risk:** Low
    *   **Implementation:**
        The AI assistant will:
        1.  Ensure `client/public/manifest.json` correctly specifies `action.default_popup` as `popup.html` and includes placeholder icons.
        2.  Create `client/public/popup.html`:
            ```html
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>Miru Popup</title>
              <link rel="stylesheet" href="popup.css">
            </head>
            <body>
              <div id="app"></div>
              <script src="popup.js" type="module"></script>
            </body>
            </html>
            ```
        3.  Create `client/public/popup.css` with basic styling for a small panel.
        4.  Implement `client/src/popup.ts` using Lit to render a simple UI:
            *   An input field labeled "Figma Frame ID (fileKey/node-id)".
            *   A "Compare" button (initially non-functional).
            *   Mount this Lit component to the `#app` div in `client/public/popup.html`.
    *   **VERIFICATION REQUIRED:**
        The user will:
        1.  Run `npm run build`.
        2.  Reload the extension in Chrome (from `chrome://extensions`).
        3.  Verify the Miru toolbar button appears.
        4.  Click the toolbar button. The popup should appear.
        5.  Verify the "Figma Frame ID" input field and "Compare" button are visible in the popup.
    *   **Mark Complete:**
    *   **Commit & Push (On Success):**
        ```bash
        git add . && git commit -m "Refactor: Complete Step 2 - Basic Extension UI - Toolbar Button & Placeholder Panel" && git push
        ```
    *   **Proceed Confirmation:**

---

*   [ ] **Task 3: Screenshot Capture (`captureVisibleTab`)**
    *   **Risk:** Medium
    *   **Implementation:**
        The AI assistant will:
        1.  Modify `client/src/popup.ts`:
            *   Add a new button "Test Capture".
            *   When "Test Capture" is clicked, send a message (e.g., `{ type: 'CAPTURE_SCREENSHOT' }`) to the service worker.
            *   Add an `<img>` tag in the popup template to display the captured image.
            *   Listen for a response message from the service worker containing the screenshot data URL and display it.
        2.  Modify `client/src/service-worker.ts`:
            *   Add a message listener for `chrome.runtime.onMessage`.
            *   If the message type is `'CAPTURE_SCREENSHOT'`:
                *   Call `chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => { ... });`
                *   Inside the callback, send a response message back to the popup with the `dataUrl`.
                *   Handle potential errors from `captureVisibleTab` (e.g., `chrome.runtime.lastError`).
    *   **VERIFICATION REQUIRED:**
        The user will:
        1.  Run `npm run build`.
        2.  Reload the extension in Chrome.
        3.  Navigate to any sample webpage.
        4.  Open the Miru popup and click the "Test Capture" button.
        5.  Verify that an image of the current tab's visible content appears within the popup.
    *   **Mark Complete:**
    *   **Commit & Push (On Success):**
        ```bash
        git add . && git commit -m "Refactor: Complete Step 3 - Screenshot Capture (captureVisibleTab)" && git push
        ```
    *   **Proceed Confirmation:**

---

*   [ ] **Task 4: Frame ID Input & Basic Message Passing for Comparison**
    *   **Risk:** Low
    *   **Implementation:**
        The AI assistant will:
        1.  Modify `client/src/popup.ts`:
            *   When the "Compare" button is clicked:
                *   Get the value from the "Figma Frame ID" input field.
                *   Send a message to the service worker, e.g., `{ type: 'START_COMPARISON', frameId: 'USER_INPUT_FRAME_ID' }`.
        2.  Modify `client/src/service-worker.ts`:
            *   In the `chrome.runtime.onMessage` listener, add a case for `'START_COMPARISON'`.
            *   When this message is received, log the `frameId` to the service worker console (e.g., `console.log('Comparison started for Frame ID:', message.frameId);`).
    *   **VERIFICATION REQUIRED:**
        The user will:
        1.  Run `npm run build`.
        2.  Reload the extension.
        3.  Open the Miru popup.
        4.  Enter a test Frame ID (e.g., "someFileKey/1:2") into the input field.
        5.  Click the "Compare" button.
        6.  Open the service worker console (from `chrome://extensions` -> Miru -> "service worker" link).
        7.  Verify the entered Frame ID is logged by the service worker.
    *   **Mark Complete:**
    *   **Commit & Push (On Success):**
        ```bash
        git add . && git commit -m "Refactor: Complete Step 4 - Frame ID Input & Basic Message Passing" && git push
        ```
    *   **Proceed Confirmation:**

---

*   [ ] **Task 5: Placeholder Figma Fetch (Simulated in Service Worker)**
    *   **Risk:** Low
    *   **Implementation:**
        The AI assistant will:
        1.  Modify `client/src/service-worker.ts`:
            *   Create a function `fetchFigmaDesign_simulated(frameId: string): Promise<string>`:
                *   This function will log that it's "fetching" the `frameId`.
                *   It will return a Promise that resolves after a short delay (e.g., 1 second using `setTimeout`).
                *   The promise will resolve with a predefined dummy PNG data URL (e.g., a small 100x100 red square as a base64 string).
            *   When the `'START_COMPARISON'` message is received:
                *   Call `fetchFigmaDesign_simulated(message.frameId)`.
                *   In the `.then()` block, log "Simulated Figma fetch complete. Design Data URL:" and the dummy data URL.
    *   **VERIFICATION REQUIRED:**
        The user will:
        1.  Run `npm run build`.
        2.  Reload the extension.
        3.  Open the Miru popup, enter any Frame ID, and click "Compare".
        4.  Check the service worker console. Verify messages indicating the simulated fetch started and completed, and the dummy PNG data URL is logged.
    *   **Mark Complete:**
    *   **Commit & Push (On Success):**
        ```bash
        git add . && git commit -m "Refactor: Complete Step 5 - Placeholder Figma Fetch (Simulated)" && git push
        ```
    *   **Proceed Confirmation:**

---

*   [ ] **Task 6: Pixel Diff Implementation (with Web Worker)**
    *   **Risk:** Medium
    *   **Sub-Task 6.1: Setup Diff Web Worker**
        *   **Implementation:**
            The AI assistant will:
            1.  Create `client/src/diff-worker.ts`.
            2.  Update `tsup.config.ts` to bundle `client/src/diff-worker.ts` into `dist/diff-worker.js`.
            3.  In `client/src/diff-worker.ts`:
                *   Set up an `onmessage` handler: `self.onmessage = (event) => { ... }`.
                *   The handler will expect `event.data` to contain `{ image1DataUrl, image2DataUrl, width, height, options }`.
                *   Initially, just log "Diff worker received data" and the received parameters.
            4.  In `client/src/service-worker.ts`:
                *   When orchestrating a comparison (after simulated Figma fetch for now):
                    *   Create two dummy PNG data URLs (e.g., a red square and a slightly different red/blue square, both 100x100).
                    *   Create a new `Worker('./diff-worker.js')`.
                    *   Post a message to the worker with these two dummy data URLs, width (100), height (100), and basic options for pixelmatch (e.g., `{ threshold: 0.1 }`).
        *   **VERIFICATION REQUIRED:**
            The user will:
            1.  Run `npm run build`.
            2.  Reload the extension.
            3.  Trigger a comparison via the popup.
            4.  Open the service worker console AND the `diff-worker.js` console (you can usually find worker consoles via `chrome://inspect/#workers`).
            5.  Verify the service worker logs sending data to the diff worker.
            6.  Verify the diff worker logs receiving the data with the two dummy image URLs and dimensions.
        *   **Mark Complete (Sub-Task 6.1):**
    *   **Sub-Task 6.2: Implement Pixel Diff Logic in Worker**
        *   **Implementation:**
            The AI assistant will:
            1.  In `client/src/diff-worker.ts`:
                *   Import `pixelmatch` and `PNG` from `pngjs`. (Note: `pngjs` might need careful handling in a worker context if it relies on Node.js Buffer/fs. We may need to adapt it or use Canvas API to get ImageData).
                *   **Alternative/Simpler initial approach**: Use Canvas API to draw images and get ImageData.
                    ```typescript
                    // Inside diff-worker.ts onmessage
                    const { image1DataUrl, image2DataUrl, width, height, options } = event.data;
                    const canvas = new OffscreenCanvas(width, height);
                    const ctx = canvas.getContext('2d');

                    async function loadImageData(dataUrl: string): Promise<ImageData | null> {
                      const img = await createImageBitmap(await fetch(dataUrl).then(r => r.blob()));
                      if (!ctx) return null;
                      ctx.clearRect(0, 0, width, height);
                      ctx.drawImage(img, 0, 0);
                      return ctx.getImageData(0, 0, width, height);
                    }

                    Promise.all([loadImageData(image1DataUrl), loadImageData(image2DataUrl)]).then(([img1Data, img2Data]) => {
                      if (!img1Data || !img2Data || !ctx) {
                        self.postMessage({ error: 'Could not load image data' });
                        return;
                      }
                      const diffCanvas = new OffscreenCanvas(width, height);
                      const diffCtx = diffCanvas.getContext('2d');
                      if (!diffCtx) return;
                      const diffImageData = diffCtx.createImageData(width, height);
                      
                      const mismatchedPixels = pixelmatch(
                        img1Data.data, img2Data.data, diffImageData.data, 
                        width, height, options
                      );

                      diffCtx.putImageData(diffImageData, 0, 0);
                      diffCanvas.convertToBlob({ type: 'image/png' }).then(blob => {
                        const reader = new FileReader();
                        reader.onload = () => {
                          self.postMessage({ diffImageUrl: reader.result, mismatchedPixels });
                        };
                        reader.readAsDataURL(blob!);
                      });
                    });
                    ```
            2.  The worker will post back `{ diffImageUrl: string, mismatchedPixels: number }` or an error.
            3.  In `client/src/service-worker.ts`:
                *   Listen for messages from the `diff-worker`.
                *   Log the received `diffImageUrl` and `mismatchedPixels`.
        *   **VERIFICATION REQUIRED:**
            The user will:
            1.  Run `npm run build`. Reload extension.
            2.  Test on displays with different `devicePixelRatio` values if possible (e.g., standard and Retina displays, or browser zoom that affects DPR for capture).
            3.  Use or simulate a `buildImageDataUrl` and a `designImageDataUrl` (simulated) of known, slightly different sizes (e.g., build 800x590, design 800x600).
            4.  Check the service worker console. It should log a data URL for the diff image and a non-zero count of mismatched pixels.
            5.  (Optional) Copy the `diffImageUrl` from the console and paste it into a browser address bar to visually confirm the diff image.
        *   **Mark Complete (Sub-Task 6.2):**
    *   **Mark Complete (Task 6):**
    *   **Commit & Push (On Success):**
        ```bash
        git add . && git commit -m "Refactor: Complete Step 6 - Pixel Diff Implementation (with Web Worker)" && git push
        ```
    *   **Proceed Confirmation:**

---

*   [ ] **Task 7: Integrate Screenshot, Simulated Figma Fetch, and Pixel Diff with Normalization**
    *   **Risk:** Medium
    *   **Implementation:**
        The AI assistant will:
        1.  Modify `client/src/service-worker.ts`:
            *   When the `'START_COMPARISON'` message is received from the popup:
                1.  Call `chrome.tabs.captureVisibleTab` to get `buildImageDataUrl`.
                2.  Call `fetchFigmaDesign_simulated` (from Task 5) to get `designImageDataUrl`.
                3.  Once both are available (using Promises/async-await):
                    *   **(New Sub-Task Implementation here - see below)**
                    *   Post `buildImageDataUrl`, `designImageDataUrl`, and their (common) dimensions to the `diff-worker`.
                4.  When the diff worker responds:
                    *   Get `diffImageUrl` and `mismatchedPixels`.
                    *   Send a message back to the popup (e.g., `{ type: 'COMPARISON_COMPLETE', buildImageUrl, designImageUrl, diffImageUrl, mismatchedPixels }`).
        2.  Modify `client/src/popup.ts`:
            *   Listen for the `'COMPARISON_COMPLETE'` message.
            *   When received, display the `buildImageUrl`, `designImageUrl` (simulated), and `diffImageUrl` in separate `<img>` tags.
            *   Display the `mismatchedPixels` count.
    *   **Sub-Task 7.1: Image Dimension Normalization & Alignment**
        *   **Risk:** Medium
        *   **Implementation:**
            The AI assistant will implement logic in `client/src/service-worker.ts` (before sending to diff-worker):
            *   Query the `devicePixelRatio` of the current display for the tab being captured.
            *   Ensure `chrome.tabs.captureVisibleTab` is called in a way that correctly captures at the native resolution of the tab content, considering DPR. The resulting image data should reflect actual pixels.
            *   When both `buildImageDataUrl` and `designImageDataUrl` are available:
                *   Create a helper function `getImageDimensions(dataUrl: string): Promise<{width: number, height: number}>` that loads an image data URL into an `Image` object to get its natural width and height.
                *   Use this helper to get dimensions for both the build and design images.
                *   Implement a strategy for mismatched dimensions for MVP:
                    *   Log the original dimensions of both images.
                    *   If dimensions differ: Log a warning. For MVP, attempt to scale the `buildImage` to match the `designImage` dimensions using an `OffscreenCanvas`. This prioritizes the Figma design's dimensions. If `designImage` is significantly larger than `buildImage` in a way that implies `buildImage` is just a partial capture, this might lead to poor results, but it's a starting point.
                    *   The output of this step should be two image data URLs (`normalizedBuildImageUrl`, `normalizedDesignImageUrl`) that have consistent dimensions, plus these `width` and `height` values to be passed to the `diff-worker`.
        *   **VERIFICATION REQUIRED:**
            The user will:
            1.  Run `npm run build`. Reload extension.
            2.  Test on displays with different `devicePixelRatio` values if possible (e.g., standard and Retina displays, or browser zoom that affects DPR for capture).
            3.  Use or simulate a `buildImageDataUrl` and a `designImageDataUrl` (simulated) of known, slightly different sizes (e.g., build 800x590, design 800x600).
            4.  Check the service worker console: verify original and normalized dimensions are logged. Verify the dimensions passed to `diff-worker` are consistent.
            5.  Visually inspect the images in the popup (if still displayed there) or the final diff output. The alignment should be reasonable for MVP (e.g., scaling should look okay, not excessively distorted).
        *   **Mark Complete (Sub-Task 7.1):**
    *   **VERIFICATION REQUIRED (for overall Task 7 after sub-task):**
        The user will:
        1.  Run `npm run build`.
        2.  Reload the extension.
        3.  Navigate to a sample webpage.
        4.  Open the Miru popup, enter any Frame ID (still for simulated Figma), and click "Compare".
        5.  The popup should now display three images: the captured screenshot, the simulated Figma design, and the diff image between them (ideally with dimensions aligned by Sub-Task 7.1).
        6.  It should also show a mismatch pixel count.
    *   **Mark Complete:**
    *   **Commit & Push (On Success):**
        ```bash
        git add . && git commit -m "Refactor: Complete Step 7 - Integrate Screenshot, Simulated Figma, and Pixel Diff with Normalization" && git push
        ```
    *   **Proceed Confirmation:**

---

*   [ ] **Task 8: Basic Overlay UI in Content Script**
    *   **Risk:** Medium
    *   **Implementation:**
        The AI assistant will:
        1.  Create `client/src/content-script.ts`.
        2.  Modify `client/public/manifest.json` to ensure `content_scripts` are declared to run on `<all_urls>` (or specific match patterns) and inject `content-script.js`.
            ```json
            // In manifest.json
            "content_scripts": [{
              "matches": ["<all_urls>"],
              "js": ["content-script.js"],
              "css": ["overlay.css"]
            }],
            "web_accessible_resources": [{
              "resources": ["overlay.css"], // If overlay.css is separate
              "matches": ["<all_urls>"]
            }]
            ```
        3.  Create `client/public/overlay.css` for styling the overlay elements.
        4.  In `client/src/service-worker.ts`:
            *   After a comparison is complete and diff results are available, instead of (or in addition to) sending to popup, send a message to the active tab's content script:
                `chrome.tabs.sendMessage(tabId, { type: 'SHOW_OVERLAY', buildImageUrl, designImageUrl, diffImageUrl });`
        5.  In `client/src/content-script.ts`:
            *   Listen for messages using `chrome.runtime.onMessage`.
            *   If message type is `'SHOW_OVERLAY'`:
                *   Remove any existing overlay elements.
                *   Create three `<img>` elements for build, design, and diff. Set their `src` and style them (fixed position, z-index, initial opacity/visibility).
                *   Create a simple slider (`<input type="range">`) to control the opacity/visibility of these images (e.g., 0=build, 0.5=diff, 1=design).
                *   Append these elements to the `document.body`.
    *   **VERIFICATION REQUIRED:**
        The user will:
        1.  Run `npm run build`.
        2.  Reload the extension.
        3.  Navigate to a sample webpage.
        4.  Trigger a comparison from the popup.
        5.  Verify that images (build, simulated design, diff) are overlaid on the current webpage.
        6.  Verify that a slider control appears and adjusting it changes the visibility/opacity of the overlaid images, allowing a scrub effect.
    *   **Mark Complete:**
    *   **Commit & Push (On Success):**
        ```bash
        git add . && git commit -m "Refactor: Complete Step 8 - Basic Overlay UI in Content Script" && git push
        ```
    *   **Proceed Confirmation:**

---

*   [ ] **Task 9: Implement Real Figma Fetch (Figma API Integration)**
    *   **Risk:** High
    *   **Sub-Task 9.1: Secure Token Storage (Options Page)**
        *   **Implementation:**
            The AI assistant will:
            1.  Create `client/public/options.html` and `client/public/options.css`.
            2.  Create `client/src/options.ts` (and update `tsup.config.ts` to bundle it).
            3.  In `client/public/manifest.json`, add an `options_page` or `options_ui` field:
                ```json
                "options_ui": {
                  "page": "options.html",
                  "open_in_tab": true
                }
                ```
            4.  Implement `client/public/options.html` and `client/src/options.ts` (using Lit or vanilla JS):
                *   An input field for "Figma Personal Access Token".
                *   A "Save Token" button.
                *   On save, store the token using `chrome.storage.local.set({ figmaToken: 'TOKEN_VALUE' })`.
                *   On load, try to retrieve and display the currently stored token (if any).
            5.  In `client/src/popup.ts`, add logic to check if a Figma token exists in `chrome.storage.local` when the popup opens. If not, display a prominent message or UI element (e.g., a 'Setup Required' notice with a button/link) that guides the user to the extension's options page to set their token.
        *   **VERIFICATION REQUIRED:**
            The user will:
            1.  Run `npm run build`.
            2.  Reload the extension.
            3.  Right-click the Miru extension icon -> Options, or go to `chrome://extensions` and click "Details" -> "Extension options".
            4.  Enter a dummy Figma token (any string) and click "Save Token".
            5.  Verify a success message or indication.
            6.  Close and reopen the options page. The saved token should still be in the input field.
            7.  (Optional) Inspect `chrome.storage.local` using DevTools on the options page or background console to verify the token is stored.
            8.  Open the popup without a token set (clear via devtools if needed). Verify the guidance message/UI appears and directs to the options page. Set a token via options, reopen popup, verify the guidance message is gone.
        *   **Mark Complete (Sub-Task 9.1):**
    *   **Sub-Task 9.2: Figma API Fetch Logic in Service Worker**
        *   **Implementation:**
            The AI assistant will:
            1.  Modify `client/src/service-worker.ts`:
                *   Replace `fetchFigmaDesign_simulated` with `fetchFigmaDesign_real(frameIdInput: string): Promise<string>`.
                *   Inside `fetchFigmaDesign_real`:
                    *   Retrieve the stored Figma token from `chrome.storage.local.get('figmaToken')`. Handle cases where token is not set (reject promise or throw error).
                    *   Parse `frameIdInput` (expected format "fileKey/nodeId", e.g., "abc123xyz/1:2") into `fileKey` and `nodeId`. Handle parsing errors.
                    *   Construct the Figma API URL: `https://api.figma.com/v1/images/${fileKey}?ids=${nodeId}&format=png&scale=1` (Note: `scale` parameter should be dynamically determined based on `devicePixelRatio` of the capture if we want 1:1 pixel mapping later, or a user setting. For MVP, `scale=1` or `scale=2` might be a starting point, but this needs to align with the dimension normalization strategy in Task 7.1).
                    *   Make a `fetch` request with the `X-Figma-Token` header.
                    *   Handle the API response:
                        *   If successful (200 OK), the JSON response will be like `{ err: null, images: { 'NODE_ID': 'IMAGE_URL' } }`. Extract the `IMAGE_URL`.
                        *   Fetch this `IMAGE_URL`. This second fetch gets the actual image blob.
                        *   Convert the image blob to a data URL.
                        *   Handle errors: invalid token (403), rate limits (429), frame not found (404 or error in JSON), network issues. Return a rejected promise or specific error object.
            2.  Update the main comparison flow to use `fetchFigmaDesign_real`.
            3.  The "Frame ID" input in the popup should now accept "fileKey/nodeId" format.
        *   **VERIFICATION REQUIRED:**
            The user will:
            1.  Have a valid Figma file key, a node ID from that file, and a valid Figma Personal Access Token.
            2.  Store the PAT via the extension's options page.
            3.  Run `npm run build`. Reload extension.
            4.  In the Miru popup, enter the "fileKey/nodeId" into the Frame ID input.
            5.  Click "Compare".
            6.  Verify the service worker console logs indicate a successful Figma API fetch (or any API errors).
            7.  If successful, the overlay on the page (and image in popup if still showing it) should display the actual design fetched from Figma, and the diff should be against this real design.
        *   **Mark Complete (Sub-Task 9.2):**
    *   **Mark Complete (Task 9):**
    *   **Commit & Push (On Success):**
        ```bash
        git add . && git commit -m "Refactor: Complete Step 9 - Implement Real Figma Fetch" && git push
        ```
    *   **Proceed Confirmation:**

---

*   [ ] **Task 10: Export Report (PNGs + JSON)**
    *   **Risk:** Medium
    *   **Implementation:**
        The AI assistant will:
        1.  Modify `client/src/popup.ts` (or DevTools panel UI later):
            *   Add an "Export Report" button. This button is only active after a comparison is complete.
            *   When clicked, send a message to the service worker (e.g., `{ type: 'EXPORT_REPORT' }`).
        2.  Modify `client/src/service-worker.ts`:
            *   Store the latest `buildImageUrl`, `designImageUrl`, `diffImageUrl`, `mismatchedPixels`, and `frameId` in a variable after each successful comparison.
            *   On `'EXPORT_REPORT'` message:
                *   Create `report.json` content: `{ timestamp: new Date().toISOString(), frameId, mismatchedPixels, maskedSelectors: [] /* placeholder for now */ }`.
                *   Implement a helper function `downloadData(dataUrlOrJsonString, filename, mimeType)`:
                    *   Creates an `<a>` element.
                    *   For data URLs, sets `a.href = dataUrl`.
                    *   For JSON, creates a `Blob`, then `URL.createObjectURL(blob)`, sets `a.href`.
                    *   Sets `a.download = filename`.
                    *   Clicks the `<a>` element.
                    *   Revokes object URL if created.
                *   Call this helper for `build.png` (using `buildImageUrl`), `design.png` (using `designImageUrl`), `diff.png` (using `diffImageUrl`), and `report.json`.
    *   **VERIFICATION REQUIRED:**
        The user will:
        1.  Run `npm run build`. Reload.
        2.  Perform a successful comparison (using real or simulated Figma data).
        3.  Click the "Export Report" button in the popup.
        4.  Verify that four files are downloaded: `build.png`, `design.png`, `diff.png`, and `report.json`.
        5.  Open `report.json` and verify its contents are correct (timestamp, frame ID used, mismatch count).
        6.  Open the PNGs and verify they are the correct images from the comparison.
    *   **Mark Complete:**
    *   **Commit & Push (On Success):**
        ```bash
        git add . && git commit -m "Refactor: Complete Step 10 - Export Report (PNGs + JSON)" && git push
        ```
    *   **Proceed Confirmation:**

---
*The plan continues with tasks for Frame Autocomplete (Task 11), Mask Config (Task 12), DevTools Panel (Task 13), and Ignore Dynamic Selectors (Task 15) following a similar structure. These would be detailed based on the PRD and Architecture doc as well.* 