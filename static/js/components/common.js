import { html } from 'htm/preact';

export function Section({ title, children }) {
    return html`
    <div class="card shadow mb-2">
        <div class="card-body">
            <h5 class="card-title text-center">${title}</h5>
            ${children}
        </div>
    </div>
    `;
}

export function Spinner() {
    return html`
    <div class="text-center my-5">
        <div class="spinner-border"></div>
    </div>
    `;
}
