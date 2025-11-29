import { AuthorData } from "./authorService";
import fs from "fs/promises";
import path from "path";

const STORAGE_DIR = path.join(process.cwd(), "data", "authors");

async function ensureStorageDir() {
  try {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  } catch (error) {
    console.error("Error creating storage directory:", error);
  }
}

export async function saveAuthorToStorage(
  slug: string,
  authorData: AuthorData
): Promise<void> {
  await ensureStorageDir();
  const filePath = path.join(STORAGE_DIR, `${slug}.json`);
  try {
    await fs.writeFile(filePath, JSON.stringify(authorData, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving author to storage:", error);
  }
}

export async function getAuthorFromStorage(
  slug: string
): Promise<AuthorData | null> {
  const filePath = path.join(STORAGE_DIR, `${slug}.json`);
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content) as AuthorData;
  } catch (error) {
    return null;
  }
}

