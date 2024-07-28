import { Component, render } from 'preact';
import { html } from 'htm/preact';

import { generateDailyEvents, loadTrackCache } from './content.js';
import { processResults, loadLicenses } from './results.js';
import { Section, LicenseBadge, SubtleBadge } from './components/common.js';
import { startRace } from './launcher.js';

class App extends Component {
    constructor() {
        super();
        this.state = {
            // game data
            documentsDirectory: undefined,
            trackCache: undefined,
            // application state
            licenses: undefined,
            dailyEvents: [],
            activeEvent: undefined,  // TODO store in localStorage
        };
    }

    render() {
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
                        Daily Corsa
                    </span>
                </div>
                ${this.state.activeEvent && html`
                    <div class="navbar-text">
                        <button class="btn btn-primary btn-sm rounded-pill px-5" onclick=${() => this.#refreshResults()}>
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
                <p>
                    <button type="button" class="btn btn-primary btn-lg" onclick=${() => this.#selectDocumentsDirectory()} autofocus>Browse...</button>
                </p>
                <p><small>This app works best on Google Chrome.</small></p>
            </div> `;
        }

        return html`
        <div class="container my-5">
            <${Section}>
                <div class="row row-cols-3">
                    ${this.state.dailyEvents.map((event) => this.#renderEventCard(event))}
                </div>
            <//>
        </div>`;
    }

    #renderEventCard(event) {
        return html`
        <div class="col">
            <div class="card text-center shadow h-100">
                <div class="card-header" title="${event.uuid}">
                    ${event.series.name}
                </div>
                <div class="card-body">
                    <h5>${this.state.trackCache[event.trackId].name}</h5>
                    <div>
                        <${LicenseBadge} license="${this.state.licenses[event.series.license]}" />
                        <${SubtleBadge}>${event.lapCount} Laps<//>
                        <${SubtleBadge}>${event.gridSize} Drivers<//>
                    </div>
                </div>
                <div class="card-footer">
                    <button class="btn btn-success m-1 w-100" onclick=${() => this.#startEvent(event)} disabled=${!!this.state.activeEvent}>Race</button>
                </div>
            </div>
        </div>`;
    }

    async #selectDocumentsDirectory() {
        const documentsDirectory = await window.showDirectoryPicker({ id: "documentsDirectory", startIn: "documents" });
        await this.#setDocumentsDirectoryState(documentsDirectory);
    }

    async #setDocumentsDirectoryState(documentsDirectory) {
        if (documentsDirectory && documentsDirectory.name === 'Assetto Corsa') {
            const trackCache = await loadTrackCache(documentsDirectory);
            const licenses = await loadLicenses(documentsDirectory);
            const dailyEvents = generateDailyEvents(trackCache, licenses);
            this.setState({ dailyEvents, licenses, documentsDirectory, trackCache });
        } else {
            this.setState({ documentsDirectory: undefined });
        }
    }

    async #startEvent(event) {
        startRace(
            {
                event,
                playerSkin: "00_official",
                player: {
                    name: "Player One",
                    nationality: "AC",
                }
            },
            this.state.documentsDirectory,
        );
        this.setState({ activeEvent: event });
    };

    async #refreshResults() {
        const success = await processResults(this.state.activeEvent, this.state.documentsDirectory);
        if (success) {
            this.setState({ dailyEvents: generateDailyEvents(this.state.trackCache), activeEvent: undefined });
        }
    }
}

render(html`<${App} />`, document.body);
