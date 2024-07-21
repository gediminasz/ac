import { Component, render } from 'preact';
import { html } from 'htm/preact';
import { get, set, del } from 'idb-keyval';

import { Section, Spinner } from './components/common.js';

class App extends Component {
    constructor() {
        super();
        this.state = {
            documentsDirectory: undefined,
            isLoading: true,
        };
    }

    async componentDidMount() {
        const documentsDirectory = await get('acDocumentsDirectory');
        await this.#setDocumentsDirectoryState(documentsDirectory);
        await this.setState({ isLoading: false });
    }

    render() {
        if (this.state.isLoading) {
            return html`<${Spinner} />`;
        }

        return html`
        <div class="container pt-2">
            ${this.#renderDirectories()}
        </div >`;
    }

    #renderDirectories() {
        return html`<${Section} title="Assetto Coppa (Alpha)">
            <div class="text-center">
            <div class="mb-4">
                <p>
                    ${this.state.documentsDirectory ? html`Documents Directory: ✅ Valid` : html`Documents Directory: ⚠️ Not Valid`}
                </p>
                <button type="button" class="btn btn-primary" onclick=${() => this.#selectDocumentsDirectory()}>Select "Assetto Corsa" directory in Documents</button>
            </div>
            </div>
        <//>`;
    }

    async #selectDocumentsDirectory() {
        const documentsDirectory = await window.showDirectoryPicker({ startIn: "documents" });
        await this.#setDocumentsDirectoryState(documentsDirectory);
    }

    async #setDocumentsDirectoryState(handle) {
        if (handle && handle.name === 'Assetto Corsa') {
            this.setState({ documentsDirectory: handle });
        } else {
            this.setState({ documentsDirectory: undefined });
        }
    }
}

render(html`<${App} />`, document.body);
