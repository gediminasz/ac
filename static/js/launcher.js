import { OPPONENTS } from './ai.js';
import { SESSION_TYPE_PRACTICE, SESSION_TYPE_QUALIFYING, SESSION_TYPE_RACE } from './constants.js';

export async function startRace(options, documentsDirectoryHandle, carCache) {
    const config = renderRaceIni(options, carCache);

    const cfg = await documentsDirectoryHandle.getDirectoryHandle("cfg");
    const raceIni = await cfg.getFileHandle("race.ini", { create: true });

    const writable = await raceIni.createWritable();
    await writable.write(config);
    await writable.close();

    console.log("Launching Assetto Corsa");
    window.open("steam://rungameid/244210/");
}

function renderRaceIni({ event, playerCar, playerSkin, player, startingPosition }, carCache) {
    const opponentCount = event.gridSize - 1;
    const opponents = Object.entries(OPPONENTS).slice(0, opponentCount).map(([name, attributes], i) => {
        const car = event.cars[0];
        const skinCount = carCache[car].skins.length;
        const skin = carCache[car].skins[i % skinCount];
        return { name, car, skin, ...attributes };
    });

    const weather = "3_clear";

    return `; Generated at ${new Date().toString()}

[AUTOSPAWN]
ACTIVE=1

[RACE]
TRACK=${event.track}
CONFIG_TRACK=${event.trackConfiguration}
MODEL=${playerCar}
MODEL_CONFIG=
CARS=${opponents.length + 1}
AI_LEVEL=${event.license.level}
FIXED_SETUP=0
PENALTIES=1
JUMP_START_PENALTY=2

[GHOST_CAR]
RECORDING=0
PLAYING=0
SECONDS_ADVANTAGE=0
LOAD=1
FILE=

[REPLAY]
FILENAME=
ACTIVE=0

[LIGHTING]
SUN_ANGLE=32
TIME_MULT=1
CLOUD_SPEED=0.2

[GROOVE]
VIRTUAL_LAPS=10
MAX_LAPS=30
STARTING_LAPS=0

[DYNAMIC_TRACK]
SESSION_START=100
SESSION_TRANSFER=100
RANDOMNESS=0
LAP_GAIN=1
PRESET=5

[REMOTE]
ACTIVE=0
SERVER_IP=
SERVER_PORT=
NAME=
TEAM=
GUID=
REQUESTED_CAR=
PASSWORD=

[LAP_INVALIDATOR]
ALLOWED_TYRES_OUT=-1

[TEMPERATURE]
AMBIENT=26
ROAD=36

[WEATHER]
NAME=${weather}

[BENCHMARK]
ACTIVE=0

[WIND]
SPEED_KMH_MIN=2
SPEED_KMH_MAX=40
DIRECTION_DEG=-1

[HEADER]
VERSION=1

[CAR_0]
MODEL=-
MODEL_CONFIG=
SKIN=${playerSkin}
DRIVER_NAME=${player.name}
NATIONALITY=
NATION_CODE=${player.nationality}

${opponents.map((opponent, i) => `
[CAR_${i + 1}]
MODEL=${opponent.car}
MODEL_CONFIG=
AI_LEVEL=${opponent.level}
AI_AGGRESSION=100
SKIN=${opponent.skin}
DRIVER_NAME=${opponent.name}
NATIONALITY=
NATION_CODE=${opponent.nationality}`).join("\n")}

${startingPosition ? `
[SESSION_0]
STARTING_POSITION=${startingPosition}
NAME=Race ${event.license.badge}
TYPE=3
LAPS=${event.lapCount}
DURATION_MINUTES=0
SPAWN_SET=START
` : `
[SESSION_0]
NAME=Practice
TYPE=${SESSION_TYPE_PRACTICE}
DURATION_MINUTES=30
SPAWN_SET=PIT

[SESSION_1]
NAME=Qualifying
TYPE=${SESSION_TYPE_QUALIFYING}
DURATION_MINUTES=8
SPAWN_SET=PIT

[SESSION_2]
NAME=Race ${event.license.badge}
TYPE=${SESSION_TYPE_RACE}
LAPS=${event.lapCount}
DURATION_MINUTES=0
SPAWN_SET=START
`}
`;
}
