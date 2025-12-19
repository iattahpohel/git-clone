import { findGitDir } from '../utils/path';
import { readHead } from '../refs/head';
import { readObject, CommitObject } from '../core/object';

/**
 * Hiển thị commit history
 */
export async function log(limit: number = 10): Promise<void> {
  const gitDir = await findGitDir();
  if (!gitDir) {
    throw new Error('Not a git repository');
  }

  let currentHash = await readHead(gitDir);
  if (!currentHash) {
    console.log('No commits yet');
    return;
  }

  let count = 0;
  while (currentHash && count < limit) {
    const object = await readObject(gitDir, currentHash);
    
    if (object instanceof CommitObject) {
      console.log(`commit ${currentHash}`);
      console.log(`Author: ${object.metadata.author.name} <${object.metadata.author.email}>`);
      console.log(`Date: ${new Date(object.metadata.author.timestamp * 1000).toLocaleString()}`);
      console.log();
      console.log(`    ${object.metadata.message.split('\n')[0]}`);
      console.log();
      
      currentHash = object.metadata.parents[0] || null;
      count++;
    } else {
      break;
    }
  }
}

