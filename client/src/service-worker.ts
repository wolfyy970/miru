console.log('Miru service-worker.ts loaded');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CAPTURE_SCREENSHOT') {
    console.log('Service worker received CAPTURE_SCREENSHOT request');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        const errorMsg = `Error querying tabs: ${chrome.runtime.lastError.message}`;
        console.error(errorMsg);
        chrome.runtime.sendMessage({ type: 'SCREENSHOT_TAKEN', error: errorMsg });
        sendResponse({ error: errorMsg });
        return;
      }
      if (tabs && tabs.length > 0 && tabs[0].id !== undefined) {
        console.log(`Attempting to capture active tab in current window. Queried Tab ID: ${tabs[0].id}`);
        // Use overload that omits windowId, defaulting to current window, active tab.
        chrome.tabs.captureVisibleTab({ format: 'png' }, (dataUrl) => {
          if (chrome.runtime.lastError) {
            const errorMsg = `Error capturing visible tab: ${chrome.runtime.lastError.message}`;
            console.error(errorMsg);
            chrome.runtime.sendMessage({ type: 'SCREENSHOT_TAKEN', error: errorMsg });
            sendResponse({ error: errorMsg });
            return;
          }
          if (dataUrl) {
            console.log('Screenshot taken, sending dataUrl to popup.');
            chrome.runtime.sendMessage({ type: 'SCREENSHOT_TAKEN', dataUrl: dataUrl });
            sendResponse({ status: 'Screenshot capture initiated', dataUrlPreview: dataUrl.substring(0, 50) + '...' });
          } else {
            const errorMsg = 'captureVisibleTab returned undefined dataUrl';
            console.error(errorMsg);
            chrome.runtime.sendMessage({ type: 'SCREENSHOT_TAKEN', error: errorMsg });
            sendResponse({ error: errorMsg });
          }
        });
      } else {
        const errorMsg = 'Could not get active tab for screenshot capture (no active tab found or tab ID missing).';
        console.error(errorMsg);
        chrome.runtime.sendMessage({ type: 'SCREENSHOT_TAKEN', error: errorMsg });
        sendResponse({ error: errorMsg });
      }
    });
    return true; // Indicates that the response will be sent asynchronously
  }
  return false; // Default for other messages or if not handling this one.
}); 