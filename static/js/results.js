export async function processResults(event, documentsDirectoryHandle) {
    const outDir = await documentsDirectoryHandle.getDirectoryHandle("out");
    const raceOut = await outDir.getFileHandle("race_out.json");

    const file = await raceOut.getFile();
    const reader = new FileReader();
    reader.readAsText(file);
    reader.addEventListener("load", () => handleParsedResults(reader.result, event, documentsDirectoryHandle));
}

function handleParsedResults(resultsText, event, documentsDirectoryHandle) {
    const results = JSON.parse(resultsText);
    console.log(results);
    const raceSession = results.sessions.find((session) => session.type === 3);
    if (raceSession) {
        const gridSize = raceSession.raceResult.length;
        const position = raceSession.raceResult.findIndex(driverId => driverId === 0) + 1;
        const result = { version: 0, position, gridSize, event };
        appendResult(result, documentsDirectoryHandle);
    }
}

async function appendResult(result, documentsDirectoryHandle) {
    const saveFile = await documentsDirectoryHandle.getFileHandle("dailies.jsonl", { create: true });

    const file = await saveFile.getFile();
    const reader = new FileReader();
    reader.readAsText(file);
    reader.addEventListener("load", async () => {
        const writable = await saveFile.createWritable({ keepExistingData: true });
        await writable.write({ type: "seek", position: file.size });
        await writable.write(JSON.stringify(result) + "\n");
        await writable.close();
    });
}
