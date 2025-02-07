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
        id: "oneMake-sprint",
        oneMake: true,
        name: "One Make • Sprint",
        license: null,
        tracks: TRACKS_SPRINT,
        cars: null,
        raceDistance: 30000,
        gridSize: 16,
    },
    {
        id: "oneMake-full",
        oneMake: true,
        name: "One Make • Full Course",
        license: null,
        tracks: TRACKS_FULL,
        cars: null,
        raceDistance: 50000,
        gridSize: 24,
    },
    {
        id: "gt3-full",
        oneMake: false,
        name: "GT3",
        license: LICENSE_GT,
        tracks: TRACKS_FULL,
        cars: [
            'bmw_z4_gt3',
            'ks_audi_r8_lms_2016',
            'ks_audi_r8_lms',
            'ks_ferrari_488_gt3',
            'ks_glickenhaus_scg003',
            'ks_lamborghini_huracan_gt3',
            'ks_mclaren_650_gt3',
            'ks_mercedes_amg_gt3',
            'ks_nissan_gtr_gt3',
            'ks_porsche_911_gt3_r_2016',
            'mclaren_mp412c_gt3',
            'mercedes_sls_gt3',
        ],
        raceDistance: 50000,
        gridSize: 24,
    },
    {
        id: "gt2-full",
        oneMake: false,
        name: "GT2",
        license: LICENSE_GT,
        tracks: TRACKS_FULL,
        cars: [
            'bmw_m3_gt2',
            'ferrari_458_gt2',
            'ks_corvette_c7r',
            'ks_porsche_911_rsr_2017',
            'p4-5_2011',
        ],
        raceDistance: 50000,
        gridSize: 24,
    },
    {
        id: "gt4-full",
        oneMake: false,
        name: "GT4",
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

export function generateDailyEvents(trackCache, carCache, history) {
    return SERIES.map((series) => {
        const availableTracks = series.tracks.filter(trackId => !trackCache[trackId].dlc);
        const trackIndex = (new Date()).getDate() % availableTracks.length;
        const trackId = availableTracks[trackIndex];

        const cars = series.cars || Object.keys(carCache);
        const availableCars = cars.filter(carId => !carCache[carId].dlc);

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

export function licenseForCar(car) {
    if (car.tags.includes("#GTE-GT3")) {
        return LICENSE_GT;
    }
    if (car.tags.includes("#GT4")) {
        return LICENSE_GT;
    }
    if (car.tags.includes("singleseater")) {
        return LICENSE_OPEN_WHEEL;
    }
    return LICENSE_ROAD;
}
