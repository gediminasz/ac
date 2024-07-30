import { readFile } from "./files.js";

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

const LICENSE_ROAD = "road";

const SERIES = [
    {
        id: "oneMake-ks_mazda_mx5_cup-sprint",
        name: "Mazda MX5 Sprint Cup",
        license: LICENSE_ROAD,
        tracks: TRACKS_SPRINT,
        cars: ["ks_mazda_mx5_cup"],
        raceDistance: 10000,
        gridSize: 16,
    },
    {
        id: "oneMake-ks_mazda_mx5_cup-global",
        name: "Mazda MX5 Global Series",
        license: LICENSE_ROAD,
        tracks: TRACKS_FULL,
        cars: ["ks_mazda_mx5_cup"],
        raceDistance: 30000,
        gridSize: 24,
    },
    {
        id: "oneMake-ks_porsche_911_gt3_cup_2017-global",
        name: "Porsche 911 GT3 Cup",
        license: LICENSE_ROAD,
        tracks: TRACKS_FULL,
        cars: ["ks_porsche_911_gt3_cup_2017"],
        raceDistance: 70000,
        gridSize: 24,
    }
];

export function generateDailyEvents(trackCache, licenses, history) {
    return SERIES.map((series) => {
        const availableTracks = series.tracks.filter(trackId => !trackCache[trackId].dlc);
        const trackIndex = (new Date()).getDate() % availableTracks.length;
        const trackId = availableTracks[trackIndex];

        const trackLengthStr = trackCache[trackId].length;
        const trackLength = trackLengthStr.includes(".") ? parseFloat(trackLengthStr) * 1000 : parseInt(trackLengthStr, 10);
        const lapCount = Math.ceil(series.raceDistance / trackLength);

        const lastResult = history.findLast((result) => result.series === series.id && result.trackId === trackId);

        return {
            uuid: crypto.randomUUID(),
            series,
            trackId,
            track: trackCache[trackId].track,
            trackConfiguration: trackCache[trackId].configuration,
            cars: series.cars,
            level: licenses[series.license].level,
            lapCount,
            gridSize: series.gridSize,
            lastResult,
        };
    });
}

export async function loadTrackCache(documentsDirectory) {
    const launcherData = await documentsDirectory.getDirectoryHandle("launcherdata");
    const cacheTrack = await launcherData.getFileHandle("cache_track.json");
    const data = await readFile(cacheTrack);
    return JSON.parse(data);
}
