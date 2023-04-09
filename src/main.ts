import { LitElement, css, html} from 'lit';

import { customElement, property } from 'lit/decorators.js';

import './clock';

@customElement('comp-main')
export class CompMain extends LitElement {
    static styles = css`
    :host {
        display: flex;
    }
    `;

    @property() counter: number = 0;
    @property() intervalID: number = 0;
    @property({ type: String }) message: string = 'IIS Agent RealTime Log';

    @property()
    message1: string = 'Hello again.';
    message2: string = 'Hello again.';
    recordingStatus: boolean = false;



    tick() {
        this.counter = this.counter + 1;

    }

    recording(event: Event) {
        if(this.recordingStatus) {
            this.message1 = "Recording....";
            this.intervalID = window.setInterval(() => this.tick(), 1000);
        }
        else {
            window.clearInterval(this.intervalID);
            this.counter = 0;
            this.message1 = "You will get the records soon";
        }
        this.recordingStatus = !this.recordingStatus;
    }

    render() {
        return html`
        <div>
            <h1>${this.message}</h1>
            <p>Normally IIS log is very big, it is hard to go through it. We just need to see the recent records, 
                especially when the problem can be reproduced.</p>
            <p>Please press the record button to start recording, then reproduce your problem.</p>
            <p>Once the problem is reproduced, press the stop button.</p>
            <button @click=${this.recording}>Record</button>
            <button @click=${this.recording}>Stop</button>
            ${this.counter}s
            <h2>${this.message1}</h2>
            <ul>
                <li>TypeScript</li>
                <li>es-dev-server</li>
            </ul>
        </div>
        `;
    }
}