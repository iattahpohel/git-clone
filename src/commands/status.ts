import * as path from 'path';
import { findGitDir } from '../utils/path';
import { Index } from '../index/index';
import { listFiles } from '../workspace/workspace';
import { readFile, fileExists } from '../workspace/workspace';
import { sha1Buffer } from '../core/hash';

/**
 * Hiển thị trạng thái repository
 */
export async function status(): Promise<void> {
  const gitDir = await findGitDir();
  if (!gitDir) {
    throw new Error('Not a git repository');
  }

  const repoRoot = path.dirname(gitDir);
  const index = new Index(gitDir);
  await index.load();
  
  const allFiles = await listFiles(repoRoot);
  const indexEntries = index.getAllEntries();
  const indexedPaths = new Set(indexEntries.map(e => e.path));
  
  const staged: string[] = [];
  const modified: string[] = [];
  const untracked: string[] = [];
  
  for (const file of allFiles) {
    if (!indexedPaths.has(file)) {
      untracked.push(file);
    } else {
      const entry = index.getEntry(file);
      if (entry && await fileExists(path.join(repoRoot, file))) {
        const content = await readFile(path.join(repoRoot, file));
        const currentHash = sha1Buffer(content);
        
        if (currentHash !== entry.hash) {
          modified.push(file);
        } else {
          staged.push(file);
        }
      }
    }
  }
  
  console.log('On branch main\n');
  
  if (staged.length > 0) {
    console.log('Changes to be committed:');
    staged.forEach(file => console.log(`  new file:   ${file}`));
    console.log();
  }
  
  if (modified.length > 0) {
    console.log('Changes not staged for commit:');
    modified.forEach(file => console.log(`  modified:   ${file}`));
    console.log();
  }
  
  if (untracked.length > 0) {
    console.log('Untracked files:');
    untracked.forEach(file => console.log(`  ${file}`));
    console.log();
  }
  
  if (staged.length === 0 && modified.length === 0 && untracked.length === 0) {
    console.log('nothing to commit, working tree clean');
  }
}

