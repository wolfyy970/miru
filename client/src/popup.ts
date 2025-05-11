import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('miru-popup')
export class MiruPopup extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
    .container {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 10px;
    }
    label {
      font-size: 0.9em;
      margin-bottom: -5px; /* Adjust spacing with input */
    }
    input[type=\"text\"] {
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 1em;
    }
    button {
      padding: 10px 15px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1em;
      margin-top: 5px; /* Add some space above the second button */
    }
    button:hover {
      background-color: #0056b3;
    }
    img#screenshotPreview {
      max-width: 100%;
      border: 1px solid #ddd;
      margin-top: 10px;
    }
  `;

  @property({ type: String })
  figmaFrameId = '';

  @state()
  private _screenshotDataUrl = '';

  @state()
  private _captureError = ''; // To store any error messages

  constructor() {
    super();
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'SCREENSHOT_TAKEN') {
        if (message.error) {
          console.error('Error from service worker during screenshot:', message.error);
          this._screenshotDataUrl = ''; // Clear image on error
          this._captureError = message.error; // Display error
        } else if (message.dataUrl) {
          this._screenshotDataUrl = message.dataUrl;
          this._captureError = ''; // Clear any previous error
        } else {
          console.warn('SCREENSHOT_TAKEN message received without dataUrl or error.');
          this._screenshotDataUrl = '';
          this._captureError = 'Unexpected response from service worker.';
        }
      }
      // Not sending async response from here, so return false or nothing.
      return false;
    });
  }

  render() {
    return html`
      <div class="container">
        <label for="figmaFrameId">Figma Frame ID (fileKey/node-id)</label>
        <input
          type="text"
          id="figmaFrameId"
          .value=\"${this.figmaFrameId}\"
          @input=\"${(e: Event) => this.figmaFrameId = (e.target as HTMLInputElement).value}\"
          placeholder="e.g., abc123xyz/123:456"
        />
        <button @click=\"${this._onCompare}\">Compare</button>
        <button @click=\"${this._onTestCapture}\">Test Capture</button>
        ${this._captureError 
          ? html`<p style=\"color: red;\">Error: ${this._captureError}</p>`
          : ''}
        ${this._screenshotDataUrl
          ? html`<img id=\"screenshotPreview\" src=\"${this._screenshotDataUrl}\" alt=\"Screenshot Preview\" />`
          : ''}
      </div>
    `;
  }

  private _onCompare() {
    // Initially non-functional, will be implemented in a later task.
    console.log('Compare button clicked. Figma Frame ID:', this.figmaFrameId);
  }

  private _onTestCapture() {
    this._screenshotDataUrl = ''; // Clear previous screenshot
    this._captureError = ''; // Clear previous error
    chrome.runtime.sendMessage({ type: 'CAPTURE_SCREENSHOT' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error sending CAPTURE_SCREENSHOT message:', chrome.runtime.lastError.message);
        return;
      }
      // Handle response from service worker if any (e.g., confirmation)
      // console.log('Response from service worker after capture request:', response);
    });
  }
}

// Mount the component to the #app div
const appRoot = document.getElementById('app');
if (appRoot) {
  const miruPopupElement = document.createElement('miru-popup');
  appRoot.appendChild(miruPopupElement);
} else {
  console.error('Could not find #app element to mount MiruPopup.');
} 