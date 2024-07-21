import { Component, render } from 'preact';
import { html } from 'htm/preact';

class App extends Component {
    render() {
        return html`
            <p>OK</p>
        `;
    }
}

render(html`<${App} />`, document.body);
