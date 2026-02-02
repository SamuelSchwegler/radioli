import {fileURLToPath} from "url";
import path from "path";

export function getXmlPath() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    return path.join(__dirname, '../programme.xml'); // da ein Ordner höher als diese Datei
}