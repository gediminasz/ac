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
        tracks: TRACKS_SPRINT,  // TODO TRACKS_FULL
        cars: ["ks_mazda_mx5_cup"],
        raceDistance: 30000,
        gridSize: 24,
    }
];

// export const TRACK_CATEGORIES = {
//     fullCourse: {
//         tracks: [
//             // Vanilla:
//             [TRACK_IMOLA, CONFIGURATION_LAYOUT_DEFAULT],
//             [TRACK_LAGUNA_SECA, CONFIGURATION_LAYOUT_DEFAULT],
//             [TRACK_MONZA, CONFIGURATION_LAYOUT_DEFAULT],
//             [TRACK_MUGELLO, CONFIGURATION_LAYOUT_DEFAULT],
//             [TRACK_NURBURGRING, CONFIGURATION_LAYOUT_GP_A],
//             [TRACK_SILVERSTONE, CONFIGURATION_GP],
//             [TRACK_SPA, CONFIGURATION_LAYOUT_DEFAULT],
//             [TRACK_VALLELUNGA, CONFIGURATION_EXTENDED_CIRCUIT],
//             // DLC:
//             [TRACK_BARCELONA, CONFIGURATION_LAYOUT_MOTO],
//             [TRACK_BRANDS_HATCH, CONFIGURATION_GP],
//             [TRACK_RED_BULL_RING, CONFIGURATION_LAYOUT_GP],
//         ],
//         gridSize: 24,
//     }
// };

export function generateDailyEvents(trackCache) {
    return SERIES.map((series) => {
        const availableTracks = series.tracks.filter(trackId => trackCache.hasOwnProperty(trackId));
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
