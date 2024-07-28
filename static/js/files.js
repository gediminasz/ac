export async function readFile(fileHandle) {
    console.log(`Reading ${fileHandle.name}`);
    return new Promise(async (resolve) => {
        const file = await fileHandle.getFile();
        const reader = new FileReader();
        reader.addEventListener("load", async () => resolve(reader.result));
        reader.readAsText(file);
    });
}
