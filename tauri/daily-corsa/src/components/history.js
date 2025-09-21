"use strict";

import { Component } from 'preact';
import { html } from 'htm/preact';

import { LicenseBadge, Section } from './common.js';

export default class History extends Component {
    render() {
        const { history } = this.props;

        if (history.length == 0) {
            return;
        }

        return html`
            <${Section} title="Race History">
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
                            ${history.toReversed().map((result) => this.#renderHistoryEntry(result))}
                        </tbody>
                    </table>
                </div>
            <//>
        `;
    }

    #renderHistoryEntry(result) {
        const { carCache, trackCache } = this.props;
        return html`
            <tr>
                <td title="${result.date}">${result.date && new Date(result.date).toDateString()}</td>
                <td>${result.seriesName}</td>
                <td><${LicenseBadge} license="${{ name: result.license, level: result.level, badge: result.badge }}" /></td>
                <td>${result.carId && carCache[result.carId].name}</td>
                <td>${trackCache[result.trackId].name}</td>
                <td>${result.lapCount}</td>
                <td title="${result.uuid}">${result.position} / ${result.gridSize}</td>
            </tr>
        `;
    }
}
