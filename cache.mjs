import { promises as fs } from "fs"; 
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  get : async (cacheName) => {
    try {
      const cacheFilename = path.join(__dirname, `static/${cacheName}.json`)
      const data = await fs.readFile(cacheFilename, 'utf8')
      return JSON.parse(data)
    } catch (err) {
      // Here you get the error when the file was not found,
      // but you also get any other error
      return {
        progress: 0
      }
    }
    
  },
  set : async (cacheName, data) => {
    const cacheFilename = path.join(__dirname, `static/${cacheName}.json`)
    await fs.writeFile(cacheFilename, JSON.stringify(data))
  }
}