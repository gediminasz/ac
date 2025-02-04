import { Component } from 'preact';
import { html } from 'htm/preact';

const NATIONALITIES = [
    // C:\Program Files (x86)\Steam\steamapps\common\assettocorsa\launcher\themes\default\modules\profile\profile.html
    "AC", "AFG", "ALA", "ALB", "DZA", "ASM", "AND", "AGO", "AIA", "ATA",
    "ATG", "ARG", "ARM", "ABW", "AUS", "AUT", "AZE", "BHS", "BHR", "BGD",
    "BRB", "BLR", "BEL", "BLZ", "BEN", "BMU", "BTN", "BOL", "BES", "BIH",
    "BWA", "BVT", "BRA", "IOT", "BRN", "BGR", "BFA", "BDI", "KHM", "CMR",
    "CAN", "CPV", "CYM", "CAF", "TCD", "CHL", "CHN", "CXR", "CCK", "COL",
    "COM", "COG", "COD", "COK", "CRI", "CIV", "HRV", "CUB", "CUW", "CYP",
    "CZE", "DNK", "DJI", "DMA", "DOM", "ECU", "EGY", "SLV", "ENG", "GNQ",
    "ERI", "EST", "ETH", "FLK", "FRO", "FJI", "FIN", "FRA", "GUF", "PYF",
    "ATF", "GAB", "GMB", "GEO", "DEU", "GHA", "GIB", "GRC", "GRL", "GRD",
    "GLP", "GUM", "GTM", "GGY", "GIN", "GNB", "GUY", "HTI", "HMD", "HND",
    "HKG", "HUN", "ISL", "IND", "IDN", "IRN", "IRQ", "IRL", "IMN", "ISR",
    "ITA", "JAM", "JPN", "JEY", "JOR", "KAZ", "KEN", "KIR", "KOR", "KWT",
    "KGZ", "LAO", "LVA", "LBN", "LSO", "LBR", "LBY", "LIE", "LTU", "LUX",
    "MAC", "MKD", "MDG", "MWI", "MYS", "MDV", "MLI", "MLT", "MHL", "MTQ",
    "MRT", "MUS", "MYT", "MEX", "FSM", "MDA", "MCO", "MNG", "MNE", "MSR",
    "MAR", "MOZ", "MMR", "NAM", "NRU", "NPL", "NLD", "NCL", "NZL", "NIR",
    "NIC", "NER", "NGA", "NIU", "NFK", "MNP", "NOR", "OMN", "PAK", "PLW",
    "PAN", "PNG", "PRY", "PER", "PHL", "PCN", "POL", "PRT", "PRI", "QAT",
    "REU", "ROU", "RUS", "RWA", "BLM", "SHN", "KNA", "LCA", "MAF", "SPM",
    "VCT", "WSM", "SMR", "STP", "SAU", "SCT", "SEN", "SRB", "SYC", "SLE",
    "SGP", "SXM", "SVK", "SVN", "SLB", "SOM", "ZAF", "SGS", "SSD", "ESP",
    "LKA", "SDN", "SUR", "SJM", "SWZ", "SWE", "CHE", "SYR", "TWN", "TJK",
    "TZA", "THA", "TLS", "TGO", "TKL", "TON", "TTO", "TUN", "TUR", "TKM",
    "TCA", "TUV", "UGA", "UKR", "ARE", "GBR", "USA", "URY", "UZB", "VUT",
    "VEN", "VNM", "VGB", "VIR", "WLS", "WLF", "ESH", "YEM", "ZMB", "ZWE",
];

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
                            name="playerName"
                            class="form-control"
                            type="text"
                            placeholder="Player One"
                            value=${this.state.playerName}
                            oninput=${(e) => this.#onInput(e)}
                        />
                    </div>
                    <div class="col-auto">
                        <label for="playerNationality" class="form-label">Player nationality</label>
                        <select
                            name="playerNationality"
                            class="form-select"
                            value=${this.state.playerNationality}
                            onChange=${(e) => this.#onInput(e)}
                        >
                            ${NATIONALITIES.map((value) => html`<option value=${value}>${value}</option>`)}
                        </select>
                    </div>
                    <div class="col-auto">
                        <button type="button" class="btn btn-primary" onclick=${() => this.props.saveSettings(this.state)}>
                            Save
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    #onInput(e) {
        this.setState({ [e.target.name]: e.target.value });
    }
}
