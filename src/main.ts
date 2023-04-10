import { LitElement, css, html} from 'lit';

import { customElement, property, state } from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';

import './clock';

@customElement('comp-main')
export class CompMain extends LitElement {
    static styles = css`
    :host {
        display: flex;
    }
    `;

    @state()
    stage:number = 0;

    @property()
    list = ['Peas', 'Carrots', 'Tomatoes'];

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

    reset() {
        this.stage = 0;
    }

    /*
    Somehow couldn't make this library work under ts,
    https://github.com/eligrey/FileSaver.js/
    So, used the way described in https://gist.github.com/philipstanislaus/c7de1f43b52531001412?permalink_comment_id=4285625#gistcomment-4285625
    */

    saveBlob = (function () {
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.setAttribute('style', 'display: none');
  
        return function (blob:Blob, fileName:string) {
          const url = window.URL.createObjectURL(blob);
          a.href = url;
          a.download = fileName;
          a.click();
          window.URL.revokeObjectURL(url);
        };
      })();

    download() {
        var blob = new Blob(["Hello, world!"], {type: "text/plain;charset=utf-8"});
        this.saveBlob(blob, "iislog.txt");
    }

    recording(event: Event) {
        if(this.recordingStatus)
            return;

        this.stage = 1;

        this.recordingStatus = true;

        this.message1 = "Recording....";
        this.intervalID = window.setInterval(() => this.tick(), 1000);

    }

    stop(event: Event) {
        if(!this.recordingStatus)
            return;
        
        this.recordingStatus = false;
        this.stage = 2;

        window.clearInterval(this.intervalID);
        this.counter = 0;
        this.message1 = "You will get the records soon";

        //start to collect data from the server

    }    

    render() {
        return html`
        <div>
            <h1>${this.message}</h1>
            <p>Normally IIS log is very big, it is hard to go through it. We just need to see the recent records, 
                especially when the problem can be reproduced.</p>
            <p>Please press the record button to start recording, then reproduce your problem.</p>
            <p>Once the problem is reproduced, press the stop button.</p>
            <button @click=${this.reset}>Reset</button>
            <button @click=${this.recording} ?disabled=${this.stage == 1}>Record</button>
            <button @click=${this.stop} ?disabled=${this.stage != 1}>Stop</button>
            ${this.recordingStatus
                ? html`
                    ${this.counter}s
                `
                : html`

                `}
            <button @click=${this.download}>Save</button>
            <h2>${when(this.stage == 2, () => html`Please wait...`)}</h2>
            <ul>
                ${this.list.map(
                (item, index) =>
                    html`
                    <li>${index}: ${item}</li>
                    `
                )}
            </ul>
        </div>
        `;
    }
}