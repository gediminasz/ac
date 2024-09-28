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

export function LicenseBadge({ license: { name, level, badge } }) {
    const title = `AI level: ${level}`;
    const style = getBadgeStyle(name);
    if (name && level && badge) {
        return html`<span title=${title} class="badge m-1 ${style}">${badge}</span>`;
    }
}

function getBadgeStyle(licenseName) {
    switch (licenseName) {
        case "road":
            return "text-bg-warning";
        case "open_wheel":
            return "text-bg-primary";
        case "gt":
            return "text-bg-success";
    }
}

export function SubtleBadge({ children }) {
    return html`<span class="badge bg-body-tertiary border m-1">${children}</span>`;
}
