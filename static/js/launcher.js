import { OPPONENTS } from './ai.js';

export async function startRace(options, documentsDirectoryHandle) {
    const config = renderRaceIni(options);

    const cfg = await documentsDirectoryHandle.getDirectoryHandle("cfg");
    const raceIni = await cfg.getFileHandle("race.ini", { create: true });

    const writable = await raceIni.createWritable();
    await writable.write(config);
    await writable.close();

    console.log("Launching Assetto Corsa");
    window.open("steam://rungameid/244210/");
}

function renderRaceIni({ event, playerSkin, player }) {
    const opponentCount = event.gridSize - 1;
    const opponents = Object.entries(OPPONENTS).slice(0, opponentCount).map(([name, attributes]) => ({
        car: event.cars[0], skin: "00_official", name, ...attributes
    }));

    const weather = "3_clear";

    return `; Generated at ${new Date().toString()}

[AUTOSPAWN]
ACTIVE=1

[RACE]
TRACK=${event.track}
CONFIG_TRACK=${event.trackConfiguration}
MODEL=${event.cars[0]}
MODEL_CONFIG=
CARS=${opponents.length + 1}
AI_LEVEL=${Math.round(event.level)}
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

[SESSION_0]
NAME=Practice
TYPE=1
DURATION_MINUTES=30
SPAWN_SET=PIT

[SESSION_1]
NAME=Qualifying
TYPE=2
DURATION_MINUTES=8
SPAWN_SET=PIT

[SESSION_2]
NAME=Race
TYPE=3
LAPS=${event.lapCount}
DURATION_MINUTES=0
SPAWN_SET=START
`;
}
