export async function processResults(documentsDirectoryHandle) {
    const outDir = await documentsDirectoryHandle.getDirectoryHandle("out");
    const raceOut = await outDir.getFileHandle("race_out.json");

    const file = await raceOut.getFile();
    const reader = new FileReader();
    reader.readAsText(file);
    reader.addEventListener("load", () => handleParsedResults(reader.result));
}

function handleParsedResults(resultsText) {
    const results = JSON.parse(resultsText);
    console.log(results);
}
