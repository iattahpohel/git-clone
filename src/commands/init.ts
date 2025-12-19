import * as fs from 'fs/promises';
import * as path from 'path';
import { writeConfig } from '../utils/config';
import { setHeadToBranch } from '../refs/head';

/**
 * Khởi tạo git repository
 */
export async function init(repoPath: string = process.cwd()): Promise<void> {
  const gitDir = path.join(repoPath, '.git');
  
  // Tạo các thư mục cần thiết
  await fs.mkdir(path.join(gitDir, 'objects'), { recursive: true });
  await fs.mkdir(path.join(gitDir, 'refs', 'heads'), { recursive: true });
  await fs.mkdir(path.join(gitDir, 'refs', 'tags'), { recursive: true });
  
  // Khởi tạo HEAD trỏ đến main branch
  await setHeadToBranch(gitDir, 'main');
  
  // Tạo config cơ bản
  await writeConfig(gitDir, {
    core: {
      repositoryformatversion: '0',
      filemode: 'true',
      bare: 'false',
    },
  });
  
  console.log(`Initialized empty Git repository in ${gitDir}`);
}

