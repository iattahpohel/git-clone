import * as fs from "fs/promises";
import * as path from "path";
import { Stats } from "fs";

/**
 * Đọc file từ workspace
 */
export async function readFile(filePath: string): Promise<Buffer> {
  return await fs.readFile(filePath);
}

/**
 * Ghi file vào workspace
 */
export async function writeFile(
  filePath: string,
  content: Buffer
): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filePath, content);
}

/**
 * Lấy file stats
 */
export async function getFileStats(filePath: string): Promise<Stats> {
  return await fs.stat(filePath);
}

/**
 * Kiểm tra file có tồn tại không
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Liệt kê tất cả files trong directory (recursive)
 */
export async function listFiles(
  dir: string,
  ignoreDirs: string[] = [".git", "node_modules"]
): Promise<string[]> {
  const files: string[] = [];

  async function walk(currentDir: string, baseDir: string): Promise<void> {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relativePath = path.relative(baseDir, fullPath);

      if (entry.isDirectory()) {
        const dirName = entry.name;
        if (!ignoreDirs.includes(dirName)) {
          await walk(fullPath, baseDir);
        }
      } else if (entry.isFile()) {
        files.push(relativePath);
      }
    }
  }

  await walk(dir, dir);
  return files;
}
