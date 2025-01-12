import { readFile } from "./files.js";
import { LICENSE_ROAD, LICENSE_OPEN_WHEEL, LICENSE_GT } from "./content.js";
import { SESSION_TYPE_RACE } from "./constants.js";

export async function processResults(event, documentsDirectoryHandle) {
    const outDir = await documentsDirectoryHandle.getDirectoryHandle("out");
    const raceOut = await outDir.getFileHandle("race_out.json");

    const data = await readFile(raceOut);
    const eventResult = JSON.parse(data);

    if (!validateResults(eventResult, event)) {
        return false;
    }

    const raceSession = eventResult.sessions.find((session) => session.type === SESSION_TYPE_RACE);
    const position = raceSession.raceResult.findIndex(driverId => driverId === 0) + 1;

    const result = {
        version: 0,
        uuid: event.uuid,
        date: (new Date()).toISOString(),

        level: event.license.level,
        badge: event.license.badge,
        position,
        gridSize: event.gridSize,

        series: event.series.id,
        license: event.series.license,

        trackId: event.trackId,
        lapCount: event.lapCount,

        carId: eventResult.players[0].car,
    };

    console.log("Writing dailies.jsonl");
    const saveFileHandle = await documentsDirectoryHandle.getFileHandle("dailies.jsonl", { create: true });
    const saveFile = await saveFileHandle.getFile();

    const writable = await saveFileHandle.createWritable({ keepExistingData: true });
    await writable.write({ type: "seek", position: saveFile.size });
    await writable.write(JSON.stringify(result) + "\n");
    await writable.close();

    return true;
}

function validateResults(results, event) {
    const trackValid = results.track === event.trackId;
    const raceSession = results.sessions.find((session) => session.type === SESSION_TYPE_RACE);
    const lapCountValid = raceSession && raceSession.lapsCount === event.lapCount;
    const gridSizeValid = results.players.length === event.gridSize;
    return trackValid && lapCountValid && gridSizeValid;
}

export async function loadHistory(documentsDirectoryHandle) {
    const saveFile = await documentsDirectoryHandle.getFileHandle("dailies.jsonl", { create: true });
    const data = await readFile(saveFile);
    return data.split("\n").filter(Boolean).filter(l => !l.startsWith("//")).map(JSON.parse);
}

export async function loadLicenses(history) {
    return {
        [LICENSE_ROAD]: makeLicense(history, LICENSE_ROAD, "R"),
        [LICENSE_OPEN_WHEEL]: makeLicense(history, LICENSE_OPEN_WHEEL, "OW"),
        [LICENSE_GT]: makeLicense(history, LICENSE_GT, "GT"),
    };
}

function makeLicense(history, name, prefix) {
    const entries = history.filter((result) => result.level && result.license === name);
    const level = calculateLevel(entries);
    return { name, level: Math.round(level), badge: `${prefix}${level.toFixed(1) * 10}` };
}

function calculateLevel(history) {
    if (history.length === 0) {
        return 90;
    }
    const levels = [];
    history.forEach(({ level, position, gridSize }) => {
        if (position <= 3) {
            levels.push(level * 1.05);
        } else if (position > gridSize - 3) {
            levels.push(level * 0.95);
        } else {
            levels.push(level);
        }
    });
    let average = levels.reduce((a, b) => a + b, 0) / levels.length;
    average = Math.min(average, 100);
    average = Math.max(average, 80);
    return average;
}
