import { readFile } from "./files.js";

export async function processResults(event, documentsDirectoryHandle, onSuccess) {
    const outDir = await documentsDirectoryHandle.getDirectoryHandle("out");
    const raceOut = await outDir.getFileHandle("race_out.json");

    const data = await readFile(raceOut);
    const eventResult = JSON.parse(data);
    const raceSession = eventResult.sessions.find((session) => session.type === 3);
    if (!raceSession) {
        return;
    }

    const position = raceSession.raceResult.findIndex(driverId => driverId === 0) + 1;

    const result = {
        version: 0,
        uuid: event.uuid,

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

    onSuccess();
}

export async function loadHistory(documentsDirectoryHandle) {
    const saveFile = await documentsDirectoryHandle.getFileHandle("dailies.jsonl", { create: true });
    const data = await readFile(saveFile);
    const results = data.split("\n").filter(Boolean).map(JSON.parse);
    console.log(results);
}
