import * as path from "path";
import { findGitDir } from "../utils/path";
import { Index } from "../index/index";
import { readFile, getFileStats } from "../workspace/workspace";
import { BlobObject } from "../core/object";
import { ObjectStorage } from "../core/storage";

/**
 * Thêm file vào staging area
 */
export async function add(filePaths: string[]): Promise<void> {
  const gitDir = await findGitDir();
  if (!gitDir) {
    throw new Error("Not a git repository");
  }

  const index = new Index(gitDir);
  await index.load();

  const storage = new ObjectStorage(gitDir);
  const repoRoot = path.dirname(gitDir);

  for (const filePath of filePaths) {
    const fullPath = path.join(repoRoot, filePath);
    const content = await readFile(fullPath);
    const stat = await getFileStats(fullPath);

    // Tạo và lưu blob object
    const blob = new BlobObject(content);
    await storage.store(blob);

    // Thêm vào index
    await index.addFile(filePath, content, stat);
  }

  console.log(`Added ${filePaths.length} file(s) to staging area`);
}
