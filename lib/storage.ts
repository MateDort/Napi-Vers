import { PoemData } from "./poemService";
import fs from "fs/promises";
import path from "path";

const STORAGE_DIR = path.join(process.cwd(), "data", "poems");

async function ensureStorageDir() {
  try {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  } catch (error) {
    console.error("Error creating storage directory:", error);
  }
}

export async function savePoemToStorage(
  date: string,
  poemData: PoemData
): Promise<void> {
  await ensureStorageDir();
  const filePath = path.join(STORAGE_DIR, `${date}.json`);
  try {
    await fs.writeFile(filePath, JSON.stringify(poemData, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving poem to storage:", error);
    throw error;
  }
}

export async function getPoemFromStorage(
  date: string
): Promise<PoemData | null> {
  const filePath = path.join(STORAGE_DIR, `${date}.json`);
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content) as PoemData;
  } catch (error) {
    // File doesn't exist or can't be read
    return null;
  }
}

