import { Component } from 'preact';
import { html } from 'htm/preact';

export default class Settings extends Component {
    constructor({ playerName, playerNationality }) {
        super();
        this.state = { playerName, playerNationality };
    }

    render() {
        return html`
            <div class="container my-3">
                <div class="row justify-content-center align-items-end">
                    <div class="col-auto">
                        <label for="playerName" class="form-label">Player name</label>
                        <input
                            id="playerName"
                            class="form-control"
                            type="text"
                            placeholder="Player One"
                            value=${this.state.playerName}
                            oninput=${(e) => this.setState({ playerName: e.target.value })}
                        />
                    </div>
                    <div class="col-auto">
                        <label for="playerName" class="form-label">Player nationality</label>
                        <input
                            id="playerName"
                            class="form-control"
                            type="text"
                            placeholder="Player One"
                            value=${this.state.playerNationality}
                            oninput=${(e) => this.setState({ playerNationality: e.target.value })}
                        />
                    </div>
                    <div class="col-auto">
                        <button type="button" class="btn btn-primary " onclick=${() => this.props.saveSettings(this.state)}>Save</button>
                    </div>
                </div>
            </div>
        `;
    }
}
