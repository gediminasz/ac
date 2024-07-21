import { Component, render } from 'preact';
import { html } from 'htm/preact';
import { get, set } from 'idb-keyval';

import { Spinner, Section, RankBadge, SubtleBadge } from './components/common.js';
import { startRace } from './launcher.js';
import { OPPONENTS } from './ai.js';
import { processResults } from './results.js';

class App extends Component {
    constructor() {
        super();
        this.state = {
            documentsDirectory: undefined,
            isLoading: true,
            isRacing: false,
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
                        AC Dailies
                    </span>
                </div>
                ${this.state.isRacing && html`
                    <div class="navbar-text">
                        <button class="btn btn-primary btn-sm rounded-pill px-5" onclick=${() => processResults({}, this.state.documentsDirectory)}>
                            Race in progress... Click here to refresh results.
                        </button>
                    </div>
                    `}
                <div class="navbar-text">
                    ${(new Date()).toDateString()}
                </div>
            </div>
        </nav>`;
    }

    #renderBody() {
        if (!this.state.documentsDirectory) {
            return html`
            <div class="text-center my-5">
                <p>Please locate the "Assetto Corsa" directory in your Documents folder.</p>
                <button type="button" class="btn btn-primary btn-lg" onclick=${() => this.#selectDocumentsDirectory()}>Browse...</button>
            </div> `;
        }

        return html`
        <div class="container my-5">
            <${Section} title="Daily Races">
                <div class="row row-cols-3">
                    <div class="col">
                        <div class="card text-center shadow h-100">
                            <div class="card-header">
                                One Make: Mazda MX5 Cup
                            </div>
                            <div class="card-body">
                                <h5>Silverstone - National</h5>
                                <div>
                                    <${RankBadge} level="90" />
                                    <${SubtleBadge}>2 Laps<//>
                                    <${SubtleBadge}>16 Drivers<//>
                                </div>
                            </div>
                            <div class="card-footer">
                                <button class="btn btn-success m-1 w-100" onclick=${() => this.#startDemoRace()} disabled=${this.state.isRacing}>Race</button>
                            </div>
                        </div>
                    </div>
                </div>
            <//>
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

    async #startDemoRace() {
        startRace(
            {
                event: {
                    track: "ks_silverstone",
                    trackConfiguration: "national",
                    level: 90,
                    lapCount: 2
                },
                playerCar: "ks_mazda_mx5_cup",
                playerSkin: "00_official",
                player: {
                    name: "Player One",
                    nationality: "AC",
                },
                opponents: Object.entries(OPPONENTS).slice(0, 15).map(([name, attributes]) => ({
                    car: "ks_mazda_mx5_cup", skin: "00_official", name, ...attributes
                })),
                weather: "3_clear"
            },
            this.state.documentsDirectory,
        );
        this.setState({ isRacing: true });
    };
}

render(html`<${App} />`, document.body);
