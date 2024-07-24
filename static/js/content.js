export const TRACKS_SPRINT = [
    // Vanilla:
    // "ks_highlands-layout_short",
    // "ks_laguna_seca",
    // "magione",
    // "ks_monza66-junior",
    "ks_silverstone-national"
    // TODO add more tracks
];

export const EVENT_CATEGORIES = [
    {
        name: "Mazda MX5 Sprint Cup",
        label: "oneMake-ks_mazda_mx5_cup-sprint",
        tracks: TRACKS_SPRINT,
        cars: ["ks_mazda_mx5_cup"],
        distance: 10000,
        gridSize: 16,
    }
];

// export const TRACK_CATEGORIES = {
//     sprint: {
//         tracks: [
//             // Vanilla:
//             [TRACK_HIGHLANDS, CONFIGURATION_LAYOUT_SHORT],
//             [TRACK_LAGUNA_SECA, CONFIGURATION_LAYOUT_DEFAULT],
//             [TRACK_MAGIONE, CONFIGURATION_LAYOUT_DEFAULT],
//             [TRACK_MONZA66, CONFIGURATION_JUNIOR],
//             [TRACK_NURBURGRING, CONFIGURATION_LAYOUT_SPRINT_B],
//             [TRACK_SILVERSTONE, CONFIGURATION_INTERNATIONAL],
//             [TRACK_SILVERSTONE, CONFIGURATION_NATIONAL],
//             [TRACK_VALLELUNGA, CONFIGURATION_CLUB_CIRCUIT],
//             [TRACK_ZANDVOORT, CONFIGURATION_LAYOUT_DEFAULT],
//             // DLC:
//             [TRACK_BRANDS_HATCH, CONFIGURATION_INDY],
//             [TRACK_RED_BULL_RING, CONFIGURATION_LAYOUT_NATIONAL],
//         ],
//         gridSize: 16,
//     },
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

export function generateDailyEvents() {
    return EVENT_CATEGORIES.map((category) => {
        const trackLabel = category.tracks[0];  // TODO track rotation
        const [track, trackConfiguration] = trackLabel.includes("-") ? trackLabel.split("-") : [trackLabel, ""];
        return {
            name: category.name,
            category: category.label,
            track,
            trackConfiguration,
            cars: category.cars,
            level: 90,  // TODO calculate based on license
            lapCount: 2,  // TODO calculate based on distance
            gridSize: category.gridSize,
        };
    });
}