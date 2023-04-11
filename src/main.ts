import { LitElement, css, html} from 'lit';

import { customElement, property, state } from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';

import ky from 'ky';

import './clock';

@customElement('comp-main')
export class CompMain extends LitElement {
    static styles = css`
    :host {
        display: flex;
    }
    `;

    @state() log:string | undefined;

    @state()
    stage:number = 0;   // 0 - init, 1 - recording, 2- stopped,  3- data arrived

    @property()
    list = [];

    @property() counter: number = 0;
    @property() intervalID: number = 0;
    @property({ type: String }) message: string = 'IIS Agent RealTime Log';

    @property()
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
        let body:string = "[]";
        if(this.log) {
            body = this.log;
        }

        var blob = new Blob([body], {type: "text/plain;charset=utf-8"});
        this.saveBlob(blob, "iislog.txt");
    }

    recording(event: Event) {
        if(this.recordingStatus)
            return;

        this.stage = 1;

        this.recordingStatus = true;


        this.intervalID = window.setInterval(() => this.tick(), 1000);

    }

    stop(event: Event) {
        if(!this.recordingStatus)
            return;
        
        this.recordingStatus = false;
        this.stage = 2;

        window.clearInterval(this.intervalID);
        this.counter = 0;


        //start to collect data from the server
        ky('/packets').then((response) => {
            response.text().then(body => {
                console.log(body);
                this.log = body;
                this.list = JSON.parse('["Peas", "Carrots", "Tomatoes"]');
                this.stage = 3;
            });
            }
        )
        .catch((error) => {
            console.log(error)
          });;


    }    

    render() {
        return html`
        <div>
            <h1>${this.message}</h1>
            <p>Normally IIS log is very big, it is hard to go through it. We just need to see the recent records, 
                especially when the problem can be reproduced.</p>
            <p>Please press the record button to start recording, then reproduce your problem.</p>
            <p>Once the problem is reproduced, press the stop button.</p>
            <div>
                <label for="node-select">Choose an application node:</label>
                <select name="nodes" id="node-select">
                    <option value="">--Please choose an option--</option>
                    <option value="owa">owa</option>
                    <option value="mapi">mapi</option>
                    <option value="ews">ews</option>
                    <option value="Microsoft-Server-ActiveSync">Microsoft-Server-ActiveSync</option>
                    <option value="ecp">ecp</option>
                    <option value="OAB">OAB</option>
                    <option value="Rpc">Rpc</option>
                    <option value="Autodiscover">Autodiscover</option>
                </select>
                <label for="level-select">Log Level:</label>
                <select name="levels" id="level-select">
                    <option value="">--Please choose an option--</option>
                    <option value="Debug">Debug</option>
                    <option value="Warning">Warning</option>
                    <option value="Info">Info</option>
                    <option value="Error">Error</option>
                    <option value="Fatal">Fatal</option>
                </select>                
                <input type="text" placeholder="Client IP">
            </div>
            <button @click=${this.reset}>Reset</button>
            <button @click=${this.recording} ?disabled=${this.stage == 1}>Record</button>
            <button @click=${this.stop} ?disabled=${this.stage != 1}>Stop</button>
            ${this.recordingStatus
                ? html`
                    ${this.counter}s
                `
                : html`

                `}
            <button @click=${this.download} ?disabled=${this.stage != 3}>Save</button>
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