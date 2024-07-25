export async function readFile(fileHandle) {
    console.log(`Reading ${fileHandle.name}`);
    return new Promise(async (resolve) => {
        const file = await fileHandle.getFile();
        const reader = new FileReader();
        reader.readAsText(file);
        reader.addEventListener("load", async () => resolve(reader.result));
    });
}
