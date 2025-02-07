"use strict";

import * as idb from 'idb-keyval';
import { Component, render } from 'preact';
import { html } from 'htm/preact';

import { generateDailyEvents, loadCache, SERIES } from './content.js';
import { PAGE_HOME, PAGE_SETTINGS } from './constants.js';
import { processResults, loadLicenses, loadHistory } from './results.js';
import { Section, LicenseBadge, SubtleBadge } from './components/common.js';
import { startRace } from './launcher.js';
import Events from './components/events.js';
import History from './components/history.js';
import Settings from './components/settings.js';

class App extends Component {
    constructor() {
        super();
        this.state = {
            // app state
            page: PAGE_HOME,

            // game data
            documentsDirectory: undefined,
            trackCache: undefined,
            carCache: undefined,

            // player data
            playerName: undefined,  // TODO remove from state?
            playerNationality: undefined,  // TODO remove from state?
            licenses: undefined,
            history: [],

            // event data
            dailyEvents: [],
            activeEvent: undefined,
        };
    }

    async componentDidMount() {
        const documentsDirectory = await idb.get("documentsDirectoryHandle");
        this.#loadData(documentsDirectory);
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
                    <span class="navbar-brand pointer" onclick=${() => this.setState({ page: PAGE_HOME })}>
                        Daily Corsa
                    </span>
                </div>
                ${this.state.activeEvent && html`
                    <div class="navbar-text">
                        <button class="btn btn-primary btn-sm fw-semibold px-5" onclick=${() => this.#refreshResults()}>
                            ${this.state.activeEvent.series.name} event is in progress... Click here to fetch results.
                        </button>
                        <button class="btn btn-secondary btn-sm ms-2" onclick=${() => this.#withdraw()}>
                            Withdraw
                        </button>
                    </div>
                `}
                <div class="navbar-text">
                    <span class="pointer" onclick=${() => this.setState({ page: PAGE_SETTINGS })}>
                        <${SubtleBadge} >${this.state.playerName}, ${this.state.playerNationality}<//>
                    </span>
                    <${SubtleBadge}>${(new Date()).toDateString()}<//>
                </div>
            </div>
        </nav>`;
    }

    #renderBody() {
        if (!this.state.documentsDirectory) {
            return html`
                <div class="text-center my-5">
                    <p>Please locate the "Assetto Corsa" directory in your Documents folder.</p>
                    <p class="my-5">
                        <img src="./static/img/documents.png" />
                        <span class="fs-1 mx-3">⇨</span>
                        <img src="./static/img/assetto-corsa.png" />
                    </p>
                    <p class="my-5">
                        <button type="button" class="btn btn-primary btn-lg" onclick=${() => this.#selectDocumentsDirectory()} autofocus>Browse...</button>
                    </p>
                    <p><small>This app works best on Google Chrome.</small></p>
                </div>
            `;
        }

        if (this.state.page === PAGE_SETTINGS) {
            return html`
                <${Settings}
                    playerName=${this.state.playerName}
                    playerNationality=${this.state.playerNationality}
                    saveSettings=${(settings) => this.#saveSettings(settings)}
                />
            `;
        }

        return html`
            <div class="container my-3">
                <${Events}
                    events=${this.state.dailyEvents}
                    carCache=${this.state.carCache}
                    trackCache=${this.state.trackCache}
                    licenses=${this.state.licenses}
                    startEvent=${(...args) => this.#startEvent(...args)}
                />
                <${History}
                    history=${this.state.history}
                    carCache=${this.state.carCache}
                    trackCache=${this.state.trackCache}
                />
            </div>
        `;
    }

    async #selectDocumentsDirectory() {
        const documentsDirectory = await window.showDirectoryPicker({ id: "documentsDirectory", startIn: "documents" });
        idb.set("documentsDirectoryHandle", documentsDirectory);
        this.#loadData(documentsDirectory);
    }

    async #loadData(documentsDirectory) {
        if (documentsDirectory && documentsDirectory.name === 'Assetto Corsa') {
            const trackCache = await loadCache(documentsDirectory, "cache_track.json");
            const carCache = await loadCache(documentsDirectory, "cache_car.json");
            const history = await loadHistory(documentsDirectory);
            const licenses = await loadLicenses(history);
            const dailyEvents = generateDailyEvents(trackCache, carCache, history);

            const activeEventJson = window.localStorage.getItem("activeEvent");
            const activeEvent = activeEventJson ? JSON.parse(activeEventJson) : undefined;

            const playerName = window.localStorage.getItem("playerName") || "Player One";
            const playerNationality = window.localStorage.getItem("playerNationality") || "AC";

            this.setState({ dailyEvents, licenses, documentsDirectory, trackCache, carCache, history, activeEvent, playerName, playerNationality });
        }
    }

    async #startEvent(event, playerCarId, startingPosition = undefined) {
        startRace(
            {
                event,
                player: { name: this.state.playerName, nationality: this.state.playerNationality, carId: playerCarId },
                startingPosition,
            },
            this.state.documentsDirectory,
            this.state.carCache,
        );
        window.localStorage.setItem("activeEvent", JSON.stringify(event));
        this.setState({ activeEvent: event });
    };

    async #refreshResults() {
        const success = await processResults(this.state.activeEvent, this.state.documentsDirectory);
        if (success) {
            const history = await loadHistory(this.state.documentsDirectory);
            const licenses = await loadLicenses(history);
            const dailyEvents = generateDailyEvents(this.state.trackCache, this.state.carCache, history);
            window.localStorage.removeItem("activeEvent");
            this.setState({ dailyEvents, licenses, history, activeEvent: undefined });
        } else {
            alert("Results not available. The event might still be in progress.");
        }
    }

    #withdraw() {
        if (confirm("Are you sure you want to withdraw from this event?")) {
            window.localStorage.removeItem("activeEvent");
            this.setState({ activeEvent: undefined });
        }
    }

    #saveSettings(newSettings) {
        console.log("Saving settings", newSettings);
        window.localStorage.setItem("playerName", newSettings.playerName);
        window.localStorage.setItem("playerNationality", newSettings.playerNationality);
        this.setState({ page: PAGE_HOME, ...newSettings });
    }
}

render(html`<${App} />`, document.body);
