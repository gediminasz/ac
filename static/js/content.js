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

export const LICENSE_ROAD = "road";
export const LICENSE_OPEN_WHEEL = "open_wheel";
export const LICENSE_GT = "gt";

export const SERIES = [
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
        id: "oneMake-ks_mazda_mx5_cup-full",
        name: "Mazda MX5 Global Series",
        license: LICENSE_ROAD,
        tracks: TRACKS_FULL,
        cars: ["ks_mazda_mx5_cup"],
        raceDistance: 30000,
        gridSize: 24,
    },
    {
        id: "oneMake-ks_porsche_911_gt3_cup_2017-full",
        name: "Porsche 911 GT3 Cup",
        license: LICENSE_ROAD,
        tracks: TRACKS_FULL,
        cars: ["ks_porsche_911_gt3_cup_2017"],
        raceDistance: 70000,
        gridSize: 24,
    },
    {
        id: "oneMake-ks_audi_tt_cup-full",
        name: "Audi TT Cup",
        license: LICENSE_ROAD,
        tracks: TRACKS_FULL,
        cars: ["ks_audi_tt_cup"],
        raceDistance: 30000,
        gridSize: 24,
    },
    {
        id: "oneMake-tatuusfa1-sprint",
        name: "Formula Rookie",
        license: LICENSE_OPEN_WHEEL,
        tracks: TRACKS_SPRINT,
        cars: ["tatuusfa1"],
        raceDistance: 30000,
        gridSize: 16,
    },
    {
        id: "oneMake-tatuusfa1-full",
        name: "Formula Abarth",
        license: LICENSE_OPEN_WHEEL,
        tracks: TRACKS_FULL,
        cars: ["tatuusfa1"],
        raceDistance: 70000,
        gridSize: 24,
    },
    {
        id: "oneMake-ks_lamborghini_huracan_st-full",
        name: "Huracan Trophy",
        license: LICENSE_GT,
        tracks: TRACKS_FULL,
        cars: ["ks_lamborghini_huracan_st"],
        raceDistance: 70000,
        gridSize: 24,
    },
];

export function generateDailyEvents(trackCache, carCache, licenses, history) {
    return SERIES.map((series) => {
        const availableTracks = series.tracks.filter(trackId => !trackCache[trackId].dlc);
        const trackIndex = (new Date()).getDate() % availableTracks.length;
        const trackId = availableTracks[trackIndex];

        const availableCars = series.cars.filter(carId => !carCache[carId].dlc);

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
            cars: availableCars,
            license: licenses[series.license],
            lapCount,
            gridSize: series.gridSize,
            lastResult,
        };
    });
}

export async function loadCache(documentsDirectory, fileName) {
    const launcherData = await documentsDirectory.getDirectoryHandle("launcherdata");
    const cache = await launcherData.getFileHandle(fileName);
    const data = await readFile(cache);
    return JSON.parse(data);
}
