import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('nano-clock')
class Clock extends LitElement {

    @property() counter: number;

  render() {
    return html`
        ${this.counter}
    `;
  }

  constructor() {
    super();
    this.counter = 0;
    setInterval(() => {
      // change just a text node
      this.counter = this.counter + 1;
    }, 1000);
  }
}
