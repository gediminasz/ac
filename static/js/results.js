import { readFile } from "./files.js";

export async function processResults(event, documentsDirectoryHandle) {
    const outDir = await documentsDirectoryHandle.getDirectoryHandle("out");
    const raceOut = await outDir.getFileHandle("race_out.json");

    const data = await readFile(raceOut);
    const eventResult = JSON.parse(data);
    const raceSession = eventResult.sessions.find((session) => session.type === 3);
    if (!raceSession) {
        return false;
    }

    const position = raceSession.raceResult.findIndex(driverId => driverId === 0) + 1;

    const result = {
        version: 0,
        uuid: event.uuid,
        date: (new Date()).toISOString(),

        level: event.level,
        position,
        gridSize: event.gridSize,

        series: event.series.id,
        license: event.series.license,

        trackId: event.trackId,
        lapCount: event.lapCount,
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

export async function loadHistory(documentsDirectoryHandle) {
    const saveFile = await documentsDirectoryHandle.getFileHandle("dailies.jsonl", { create: true });
    const data = await readFile(saveFile);
    return data.split("\n").filter(Boolean).filter(l => !l.startsWith("//")).map(JSON.parse);
}

export async function loadLicenses(history) {
    return {
        road: makeLicense(history, "road", "R"),
    };
}

function makeLicense(history, key, label) {
    const entries = history.filter((result) => result.license === key);
    const level = calculateLevel(entries);
    return { level: Math.round(level), label: `${label}${level.toFixed(1) * 10}` };
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
