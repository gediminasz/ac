import { Component, render } from 'preact';
import { html } from 'htm/preact';
import { get, set } from 'idb-keyval';

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

        return [
            this.#renderNavBar(),
            this.#renderBody(),
        ];
    }

    #renderNavBar() {
        return html`
        <nav class="navbar bg-body-tertiary">
            <div class="container-fluid">
                <div class="navbar-text">
                    <span class="navbar-brand">
                        AutoCup (Alpha)
                    </span>
                </div>
            </div>
        </nav>`;
    }

    #renderBody() {
        if (!this.state.documentsDirectory) {
            return this.#renderDocumentsDirectorySelector();
        }
    }

    #renderDocumentsDirectorySelector() {
        return html`
        <div class="text-center my-5">
            <p>Please locate the "Assetto Corsa" directory in your Documents folder.</p>
            <button type="button" class="btn btn-primary btn-lg" onclick=${() => this.#selectDocumentsDirectory()}>Browse...</button>
        </div>`;
    }

    async #selectDocumentsDirectory() {
        const documentsDirectory = await window.showDirectoryPicker({ startIn: "documents" });
        set('acDocumentsDirectory', documentsDirectory);
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
