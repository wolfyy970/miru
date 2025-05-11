import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

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
    }
    button:hover {
      background-color: #0056b3;
    }
  `;

  @property({ type: String })
  figmaFrameId = '';

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
      </div>
    `;
  }

  private _onCompare() {
    // Initially non-functional, will be implemented in a later task.
    console.log('Compare button clicked. Figma Frame ID:', this.figmaFrameId);
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