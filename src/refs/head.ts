import * as fs from "fs/promises";
import * as path from "path";
import { readRef } from "./refs";

const HEAD_FILE = "HEAD";

/**
 * Đọc HEAD - trả về hash của commit hiện tại hoặc ref path
 */
export async function readHead(gitDir: string): Promise<string | null> {
  const headPath = path.join(gitDir, HEAD_FILE);

  try {
    const content = await fs
      .readFile(headPath, "utf-8")
      .then((s: string) => s.trim());

    // Nếu HEAD trỏ đến ref (vd: ref: refs/heads/main)
    if (content.startsWith("ref: ")) {
      const refPath = content.substring(5);
      return await readRef(gitDir, refPath);
    }

    // Nếu HEAD chứa hash trực tiếp (detached HEAD)
    return content;
  } catch {
    return null;
  }
}

/**
 * Ghi HEAD - trỏ đến một branch
 */
export async function setHeadToBranch(
  gitDir: string,
  branchName: string
): Promise<void> {
  const headPath = path.join(gitDir, HEAD_FILE);
  const content = `ref: refs/heads/${branchName}\n`;
  await fs.writeFile(headPath, content, "utf-8");
}

/**
 * Ghi HEAD - trỏ trực tiếp đến một commit (detached HEAD)
 */
export async function setHeadToCommit(
  gitDir: string,
  commitHash: string
): Promise<void> {
  const headPath = path.join(gitDir, HEAD_FILE);
  await fs.writeFile(headPath, commitHash + "\n", "utf-8");
}

/**
 * Lấy tên branch hiện tại từ HEAD
 */
export async function getCurrentBranch(gitDir: string): Promise<string | null> {
  const headPath = path.join(gitDir, HEAD_FILE);

  try {
    const content = await fs
      .readFile(headPath, "utf-8")
      .then((s: string) => s.trim());

    if (content.startsWith("ref: ")) {
      const refPath = content.substring(5);
      // refs/heads/main -> main
      return path.basename(refPath);
    }

    return null; // Detached HEAD
  } catch {
    return null;
  }
}
