import * as path from 'path';
import * as fs from 'fs/promises';

/**
 * Tìm .git directory từ thư mục hiện tại hoặc parent directories
 */
export async function findGitDir(startDir: string = process.cwd()): Promise<string | null> {
  let currentDir = path.resolve(startDir);
  const root = path.parse(currentDir).root;

  while (currentDir !== root) {
    const gitDir = path.join(currentDir, '.git');
    
    try {
      const stat = await fs.stat(gitDir);
      if (stat.isDirectory()) {
        return gitDir;
      }
    } catch {
      // .git không tồn tại, tiếp tục tìm ở parent
    }

    currentDir = path.dirname(currentDir);
  }

  return null;
}

/**
 * Kiểm tra có phải git repository không
 */
export async function isGitRepository(dir: string = process.cwd()): Promise<boolean> {
  const gitDir = await findGitDir(dir);
  return gitDir !== null;
}

