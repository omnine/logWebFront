import { LitElement, css, html} from 'lit';

import { customElement, property, state } from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';

import ky from 'ky';

//import './clock';

@customElement('comp-main')
export class CompMain extends LitElement {
    static styles = css`
    :host {
        display: flex;
    }
    select {
        font-size: 0.9rem;
        padding: 2px 5px;
    }
    div {
        margin: 10px auto;
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
    @state() clientIP:string = '';
    @state() selectedNode:string | undefined;
    @state() selectedLevel:string | undefined;

    @property()
    recordingStatus: boolean = false;



    tick() {
        this.counter = this.counter + 1;

    }

    reset() {
        this.stage = 0;
        this.list = [];
        this.log = "[]";
    }

    resize() {
        ky.post('/resize', {json: {capacity: 2000}});
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

        ky.post('/recording', {json: {level: this.selectedLevel, node: this.selectedNode, clientIP: this.clientIP}});

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
                this.stage = 3;
                try {
                    this.list = JSON.parse(body);
                } catch(e) {
                    alert(e); // error in the above string (in this case, yes)!
                }
            });
            }
        )
        .catch((error) => {
            console.log(error)
          });;


    }

    changeClientIP(event: Event) {
        const input = event.target as HTMLInputElement;
        this.clientIP = input.value;
    }

    onChangeNode(event: Event) {
        const input = event.target as HTMLInputElement;
        console.log(input.value);
        this.selectedNode = input.value;        
    }

    onChangeLevel(event: Event) {
        const input = event.target as HTMLInputElement;
        console.log(input.value);
        this.selectedLevel = input.value;
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
                <label for="capacity">Number of logs (200-10000):</label>
                <input type="number" id="capacity" name="capacity"  min="200" max="10000" placeholder="2000">
                <button @click=${this.resize}>Resize</button>
            </div>
            <div>
                <select name="nodes" id="node-select" @change="${this.onChangeNode}">
                    <option value="">--Choose an application node--</option>
                    <option value="owa">owa</option>
                    <option value="mapi">mapi</option>
                    <option value="ews">ews</option>
                    <option value="Microsoft-Server-ActiveSync">Microsoft-Server-ActiveSync</option>
                    <option value="ecp">ecp</option>
                    <option value="OAB">OAB</option>
                    <option value="Rpc">Rpc</option>
                    <option value="Autodiscover">Autodiscover</option>
                </select>
                <select name="levels" id="level-select" @change="${this.onChangeLevel}">
                    <option value="">--Choose a level--</option>
                    <option value="Debug">Debug</option>
                    <option value="Warning">Warning</option>
                    <option value="Info">Info</option>
                    <option value="Error">Error</option>
                    <option value="Fatal">Fatal</option>
                </select>                
                <input type="text" @input=${this.changeClientIP} placeholder="Client IP">
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