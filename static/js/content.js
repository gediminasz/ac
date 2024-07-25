const TRACKS_SPRINT = [
    // Vanilla:
    "ks_highlands-layout_short",
    "ks_laguna_seca",
    "magione",
    "ks_monza66-junior",
    "ks_nurburgring-layout_sprint_b",
    "ks_silverstone-international",
    "ks_silverstone-national",
    "ks_vallelunga-club_circuit",
    "ks_zandvoort",
    // DLC:
    "ks_brands_hatch-gp",
    "ks_red_bull_ring-layout_national"
];

const TRACKS_FULL = [
    // Vanilla:
    "imola",
    "ks_laguna_seca",
    "monza",
    "mugello",
    "ks_nurburgring-layout_gp_a",
    "ks_silverstone-gp",
    "spa",
    "ks_vallelunga-extended_circuit",
    // DLC:
    "ks_barcelona-layout_moto",
    "ks_brands_hatch-gp",
    "ks_red_bull_ring-layout_gp",
];

const SERIES = [
    {
        name: "Mazda MX5 Sprint Cup",
        label: "oneMake-ks_mazda_mx5_cup-sprint",
        tracks: TRACKS_SPRINT,
        cars: ["ks_mazda_mx5_cup"],
        raceDistance: 10000,
        gridSize: 16,
    },
    {
        name: "Mazda MX5 Global Series",
        label: "oneMake-ks_mazda_mx5_cup-global",
        tracks: TRACKS_FULL,
        cars: ["ks_mazda_mx5_cup"],
        raceDistance: 30000,
        gridSize: 24,
    }
];

export function generateDailyEvents(trackCache) {
    return SERIES.map((series) => {
        const availableTracks = series.tracks.filter(trackId => !trackCache[trackId].dlc);
        console.log({ availableTracks });
        const trackIndex = (new Date()).getDate() % availableTracks.length;
        const trackId = availableTracks[trackIndex];

        const trackLengthStr = trackCache[trackId].length;
        const trackLength = trackLengthStr.includes(".") ? parseFloat(trackLengthStr) * 1000 : parseInt(trackLengthStr, 10);
        const lapCount = Math.ceil(series.raceDistance / trackLength);

        return {
            name: series.name,
            series: series.label,
            trackId,
            track: trackCache[trackId].track,
            trackConfiguration: trackCache[trackId].configuration,
            cars: series.cars,
            level: 90,  // TODO calculate based on license
            lapCount,
            gridSize: series.gridSize,
        };
    });
}

export async function loadTrackCache(documentsDirectory) {
    return new Promise(async (resolve) => {
        const launcherData = await documentsDirectory.getDirectoryHandle("launcherdata");
        const raceOut = await launcherData.getFileHandle("cache_track.json");
        const file = await raceOut.getFile();
        const reader = new FileReader();
        reader.readAsText(file);
        reader.addEventListener("load", async () => resolve(JSON.parse(reader.result)));
    });
}
