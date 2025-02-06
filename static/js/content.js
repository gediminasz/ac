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
        name: "Mazda MX5 Cup • Sprint",
        license: LICENSE_ROAD,
        tracks: TRACKS_SPRINT,
        cars: ["ks_mazda_mx5_cup"],
        raceDistance: 10000,
        gridSize: 16,
    },
    {
        id: "oneMake-ks_mazda_mx5_cup-full",
        name: "Mazda MX5 Cup • Full Course",
        license: LICENSE_ROAD,
        tracks: TRACKS_FULL,
        cars: ["ks_mazda_mx5_cup"],
        raceDistance: 30000,
        gridSize: 24,
    },
    {
        id: "oneMake-ks_porsche_911_gt3_cup_2017-full",
        name: "Porsche 911 GT3 Cup • Full Course",
        license: LICENSE_ROAD,
        tracks: TRACKS_FULL,
        cars: ["ks_porsche_911_gt3_cup_2017"],
        raceDistance: 50000,
        gridSize: 24,
    },
    {
        id: "oneMake-ks_audi_tt_cup-full",
        name: "Audi TT Cup • Full Course",
        license: LICENSE_ROAD,
        tracks: TRACKS_FULL,
        cars: ["ks_audi_tt_cup"],
        raceDistance: 30000,
        gridSize: 24,
    },
    {
        id: "oneMake-tatuusfa1-sprint",
        name: "Formula Abarth • Sprint",
        license: LICENSE_OPEN_WHEEL,
        tracks: TRACKS_SPRINT,
        cars: ["tatuusfa1"],
        raceDistance: 30000,
        gridSize: 16,
    },
    {
        id: "oneMake-tatuusfa1-full",
        name: "Formula Abarth • Full Course",
        license: LICENSE_OPEN_WHEEL,
        tracks: TRACKS_FULL,
        cars: ["tatuusfa1"],
        raceDistance: 50000,
        gridSize: 24,
    },
    {
        id: "oneMake-ks_lamborghini_huracan_st-full",
        name: "Super Trofeo • Full Course",
        license: LICENSE_GT,
        tracks: TRACKS_FULL,
        cars: ["ks_lamborghini_huracan_st"],
        raceDistance: 50000,
        gridSize: 24,
    },
    {
        id: "gt3-full",
        name: "GT3 • Full Course",
        license: LICENSE_GT,
        tracks: TRACKS_FULL,
        cars: [
            'bmw_m3_gt2',
            'bmw_z4_gt3',
            'ferrari_458_gt2',
            'ks_audi_r8_lms',
            'ks_audi_r8_lms_2016',
            'ks_corvette_c7r',
            'ks_ferrari_488_gt3',
            'ks_glickenhaus_scg003',
            'ks_lamborghini_huracan_gt3',
            'ks_lamborghini_huracan_st',
            'ks_mclaren_650_gt3',
            'ks_mercedes_amg_gt3',
            'ks_nissan_gtr_gt3',
            'ks_porsche_911_gt3_r_2016',
            'ks_porsche_911_rsr_2017',
            'mclaren_mp412c_gt3',
            'mercedes_sls_gt3',
            'p4-5_2011',
        ],
        raceDistance: 50000,
        gridSize: 24,
    },
    {
        id: "gt4-full",
        name: "GT4 • Full Course",
        license: LICENSE_GT,
        tracks: TRACKS_FULL,
        cars: [
            'ks_bmw_m235i_racing',
            'ks_maserati_gt_mc_gt4',
            'ks_porsche_cayman_gt4_clubsport',
            'lotus_2_eleven_gt4',
            'lotus_evora_gtc',
            'lotus_evora_gx',
        ],
        raceDistance: 50000,
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
