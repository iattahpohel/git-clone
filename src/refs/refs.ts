import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Đọc ref (branch hoặc tag)
 */
export async function readRef(gitDir: string, refPath: string): Promise<string | null> {
  const fullPath = path.join(gitDir, refPath);
  
  try {
    const content = await fs.readFile(fullPath, 'utf-8');
    return content.trim();
  } catch {
    return null;
  }
}

/**
 * Ghi ref
 */
export async function writeRef(gitDir: string, refPath: string, hash: string): Promise<void> {
  const fullPath = path.join(gitDir, refPath);
  const dir = path.dirname(fullPath);
  
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(fullPath, hash + '\n', 'utf-8');
}

/**
 * Xóa ref
 */
export async function deleteRef(gitDir: string, refPath: string): Promise<void> {
  const fullPath = path.join(gitDir, refPath);
  
  try {
    await fs.unlink(fullPath);
  } catch {
    // Ref không tồn tại, bỏ qua
  }
}

/**
 * Liệt kê tất cả branches
 */
export async function listBranches(gitDir: string): Promise<string[]> {
  const headsDir = path.join(gitDir, 'refs', 'heads');
  
  try {
    const files = await fs.readdir(headsDir);
    return files;
  } catch {
    return [];
  }
}

/**
 * Liệt kê tất cả tags
 */
export async function listTags(gitDir: string): Promise<string[]> {
  const tagsDir = path.join(gitDir, 'refs', 'tags');
  
  try {
    const files = await fs.readdir(tagsDir);
    return files;
  } catch {
    return [];
  }
}

