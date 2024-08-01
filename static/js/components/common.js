import { html } from 'htm/preact';

export function Section({ title, children }) {
    return html`
    <div class="card shadow mb-2">
        <div class="card-body">
            ${title && html`<h5 class="card-title text-center">${title}</h5>`}
            ${children}
        </div>
    </div>
    `;
}

export function LicenseBadge({ license: { level, badge } }) {
    const title = `AI level: ${level}`;
    if (level === 100) {
        return html`<span title=${title} class="badge m-1 text-bg-warning">${badge}</span>`;
    } else if (level >= 95) {
        return html`<span title=${title} class="badge m-1 text-bg-danger">${badge}</span>`;
    } else if (level >= 90) {
        return html`<span title=${title} class="badge m-1 text-bg-success">${badge}</span>`;
    } else if (level >= 85) {
        return html`<span title=${title} class="badge m-1 text-bg-primary">${badge}</span>`;
    } else if (level >= 80) {
        return html`<span title=${title} class="badge m-1 text-bg-secondary">${badge}</span>`;
    }
}

export function SubtleBadge({ children }) {
    return html`<span class="badge bg-body-tertiary border m-1">${children}</span>`;
}
