import { PoemDataPage } from "./poemDataService";
import fs from "fs/promises";
import path from "path";

const STORAGE_DIR = path.join(process.cwd(), "data", "poem-data");

async function ensureStorageDir() {
  try {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  } catch (error) {
    console.error("Error creating storage directory:", error);
  }
}

export async function savePoemDataToStorage(
  slug: string,
  poemData: PoemDataPage
): Promise<void> {
  await ensureStorageDir();
  const filePath = path.join(STORAGE_DIR, `${slug}.json`);
  try {
    await fs.writeFile(filePath, JSON.stringify(poemData, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving poem data to storage:", error);
  }
}

export async function getPoemDataFromStorage(
  slug: string
): Promise<PoemDataPage | null> {
  const filePath = path.join(STORAGE_DIR, `${slug}.json`);
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content) as PoemDataPage;
  } catch (error) {
    return null;
  }
}

