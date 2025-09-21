"use strict";

import { Component } from 'preact';
import { html } from 'htm/preact';
import * as _ from 'lodash';

import { LicenseBadge, Section, SubtleBadge } from './common.js';
import { LICENSE_NAMES } from '../content.js';

export default class Events extends Component {
    render() {
        const { events, carCache, trackCache, history, licenses, startEvent } = this.props;
        const eventCards = events.map((event) =>
            html`<${EventCard}
                event=${event}
                carCache=${carCache}
                trackCache=${trackCache}
                history=${history}
                licenses=${licenses}
                startEvent=${startEvent}
            />`
        );
        return html`
            <${Section}>
                <div class="row row-cols-3 gx-3 gy-3">
                    ${eventCards}
                </div>
            <//>
        `;
    }
}

class EventCard extends Component {
    constructor({ event, carCache }) {
        super();

        const carChoices = Object.values(carCache).filter(({ id }) => event.cars.includes(id));
        const carIds = carChoices.map(({ id }) => id);
        const previousCarId = window.localStorage.getItem(`cache.playerCarChoice.${event.series.id}`);

        if (carIds.includes(previousCarId)) {
            this.state = { carChoices, playerCarId: previousCarId };
        } else {
            this.state = { carChoices, playerCarId: carChoices[0].id };
            localStorage.setItem(`cache.playerCarChoice.${event.series.id}`, carChoices[0].id);
        }
    }

    render() {
        const { event, licenses, trackCache, carCache } = this.props;
        const { carChoices, playerCarId } = this.state;

        const licenseId = event.series.oneMake ? carCache[playerCarId]._licenseId : event.series.license;
        const license = licenses[licenseId];

        const cars = event.series.oneMake ? [this.state.playerCarId] : event.cars;

        const carChoicesForLicense = _.groupBy(_.sortBy(carChoices, ["_licenseId", "name"]), "_licenseId");

        return html`
            <div class="col">
                <div class="card text-center shadow h-100">
                    <div class="card-header" title="${event.uuid}">
                        ${event.series.name}
                    </div>
                    <div class="card-body">
                        <h5>${trackCache[event.trackId].name}</h5>
                        <div class="mb-2">
                            <${LicenseBadge} license="${license}" />
                            <${SubtleBadge}>${event.series.raceDistance / 1000} km<//>
                            <${SubtleBadge}>${event.lapCount} Laps<//>
                            <${SubtleBadge}>${event.gridSize} Drivers<//>
                        </div>
                        <div>
                            <select
                                class="form-select form-select-sm"
                                value=${playerCarId}
                                onChange=${(e) => this.#selectCar(e.target.value)}
                            >
                                ${Object.entries(carChoicesForLicense).map(([licenseId, carChoices]) => html`
                                    <optgroup label=${LICENSE_NAMES[licenseId]}>
                                        ${carChoices.map((car) => html`<option value=${car.id}>${car.name}</option>`)}
                                    </optgroup>
                                `)}
                            </select>
                        </div>
                    </div>
                    <div class="card-footer d-flex">
                        ${this.#renderEventCardFooter({ ...event, license, cars })}
                    </div>
                </div>
            </div>
        `;
    }

    #renderEventCardFooter(event) {
        if (event.cars.length == 0) {
            return html`<button class="btn btn-secondary m-1 flex-grow-1 fw-semibold" disabled>Content missing</button>`;
        }

        const lastResult = this.props.history.findLast((result) => (result.license === event.license.name) && (result.trackId === event.trackId));

        return html`
            <button
                class="btn btn-success m-1 flex-grow-1 fw-semibold"
                onclick=${() => this.props.startEvent(event, this.state.playerCarId)}
                disabled=${!!this.state.activeEvent}
            >
                Race
            </button>
            ${lastResult && html`
                <button
                    class="btn btn-success m-1"
                    onclick=${() => this.props.startEvent(event, this.state.playerCarId, lastResult.position)}
                    disabled=${!!this.state.activeEvent}
                    title="Skip qualifying and start from P${lastResult.position}"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-fast-forward-fill" viewBox="0 0 16 16">
                        <path d="M7.596 7.304a.802.802 0 0 1 0 1.392l-6.363 3.692C.713 12.69 0 12.345 0 11.692V4.308c0-.653.713-.998 1.233-.696z"/>
                        <path d="M15.596 7.304a.802.802 0 0 1 0 1.392l-6.363 3.692C8.713 12.69 8 12.345 8 11.692V4.308c0-.653.713-.998 1.233-.696z"/>
                    </svg>
                </button>
            `}
        `;
    }

    #selectCar(carId) {
        window.localStorage.setItem(`cache.playerCarChoice.${this.props.event.series.id}`, carId);
        this.setState({ playerCarId: carId });
    }
}
