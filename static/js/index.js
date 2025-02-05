"use strict";

import * as idb from 'idb-keyval';
import { Component, render } from 'preact';
import { html } from 'htm/preact';

import { generateDailyEvents, loadCache, SERIES } from './content.js';
import { PAGE_HOME, PAGE_SETTINGS } from './constants.js';
import { processResults, loadLicenses, loadHistory } from './results.js';
import { Section, LicenseBadge, SubtleBadge } from './components/common.js';
import { startRace } from './launcher.js';
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
            playerName: undefined,
            playerNationality: undefined,
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
            </div>`;
        }

        if (this.state.page === PAGE_SETTINGS) {
            return html`<${Settings}
                playerName=${this.state.playerName}
                playerNationality=${this.state.playerNationality}
                saveSettings=${(settings) => this.#saveSettings(settings)}
            />`;
        } else {
            return html`
                <div class="container my-3">
                    <${Section}>
                        <div class="row row-cols-3 gx-3 gy-3">
                            ${this.state.dailyEvents.map((event) => this.#renderEventCard(event))}
                        </div>
                    <//>
                    ${this.state.history.length > 0 && this.#renderHistory()}
                </div>
            `;
        }
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
                        <${LicenseBadge} license="${event.license}" />
                        <${SubtleBadge}>${event.series.raceDistance / 1000} km<//>
                        <${SubtleBadge}>${event.lapCount} Laps<//>
                        <${SubtleBadge}>${event.gridSize} Drivers<//>
                    </div>
                </div>
                <div class="card-footer d-flex">
                    ${this.#renderEventCardFooter(event)}
                </div>
            </div>
        </div>`;
    }

    #renderEventCardFooter(event) {
        if (event.cars.length == 0) {
            return html`<button class="btn btn-secondary m-1 flex-grow-1 fw-semibold" disabled>Content missing</button>`;
        }

        return html`
        <button class="btn btn-success m-1 flex-grow-1 fw-semibold" onclick=${() => this.#startEvent(event)} disabled=${!!this.state.activeEvent}>Race</button>
        ${event.lastResult && html`
            <button class="btn btn-success m-1" onclick=${() => this.#startEvent(event, event.lastResult.position)} disabled=${!!this.state.activeEvent} title="Skip qualifying and start from P${event.lastResult.position}">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-fast-forward-fill" viewBox="0 0 16 16">
                    <path d="M7.596 7.304a.802.802 0 0 1 0 1.392l-6.363 3.692C.713 12.69 0 12.345 0 11.692V4.308c0-.653.713-.998 1.233-.696z"/>
                    <path d="M15.596 7.304a.802.802 0 0 1 0 1.392l-6.363 3.692C8.713 12.69 8 12.345 8 11.692V4.308c0-.653.713-.998 1.233-.696z"/>
                </svg>
            </button>
        `}`;
    }

    #renderHistory() {
        const mostRecentResults = this.state.history.toReversed();
        return html`<${Section} title="Race History">
            <div style="max-height: 25em;" class="overflow-auto">
                <table class="table text-center">
                    <thead class="sticky-top">
                        <tr>
                            <th>Date</th>
                            <th>Series</th>
                            <th>Rank</th>
                            <th>Car</th>
                            <th>Track</th>
                            <th>Laps</th>
                            <th>Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${mostRecentResults.map((result) => this.#renderHistoryEntry(result))}
                    </tbody>
                </table>
            </div>
        <//>`;
    }

    #renderHistoryEntry({ date, series, license, level, badge, position, gridSize, trackId, lapCount, carId, uuid }) {
        const seriesData = SERIES.find((s) => s.id === series);
        return html`<tr>
            <td title="${date}">${date && new Date(date).toDateString()}</td>
            <td>${seriesData ? seriesData.name : series}</td>
            <td><${LicenseBadge} license="${{ name: license, level, badge }}" /></td>
            <td>${carId && this.state.carCache[carId].name}</td>
            <td>${this.state.trackCache[trackId].name}</td>
            <td>${lapCount}</td>
            <td title="${uuid}">${position} / ${gridSize}</td>
        </tr>`;
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
            const dailyEvents = generateDailyEvents(trackCache, carCache, licenses, history);

            const activeEventJson = window.localStorage.getItem("activeEvent");
            const activeEvent = activeEventJson ? JSON.parse(activeEventJson) : undefined;

            const playerName = window.localStorage.getItem("playerName") || "Player One";
            const playerNationality = window.localStorage.getItem("playerNationality") || "AC";

            this.setState({ dailyEvents, licenses, documentsDirectory, trackCache, carCache, history, activeEvent, playerName, playerNationality });
        }
    }

    async #startEvent(event, startingPosition = undefined) {
        startRace(
            {
                event,
                player: { name: this.state.playerName, nationality: this.state.playerNationality, car: event.cars[0] },
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
            const dailyEvents = generateDailyEvents(this.state.trackCache, this.state.carCache, licenses, history);
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
