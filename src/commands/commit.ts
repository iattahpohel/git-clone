import * as path from 'path';
import { findGitDir } from '../utils/path';
import { Index } from '../index/index';
import { TreeObject, CommitObject, TreeEntry } from '../core/object';
import { ObjectStorage } from '../core/storage';
import { readHead, setHeadToBranch } from '../refs/head';
import { writeRef } from '../refs/refs';
import { getCurrentBranch } from '../refs/head';

/**
 * Tạo commit
 */
export async function commit(message: string, author?: { name: string; email: string }): Promise<void> {
  const gitDir = await findGitDir();
  if (!gitDir) {
    throw new Error('Not a git repository');
  }

  const index = new Index(gitDir);
  await index.load();
  
  const entries = index.getAllEntries();
  if (entries.length === 0) {
    throw new Error('Nothing to commit');
  }

  const storage = new ObjectStorage(gitDir);
  
  // Tạo tree object từ index
  const treeEntries: TreeEntry[] = entries.map(entry => ({
    mode: '100644', // Regular file
    name: path.basename(entry.path),
    hash: entry.hash,
  }));
  
  const tree = new TreeObject(treeEntries);
  const treeHash = await storage.store(tree);
  
  // Lấy parent commit
  const parentHash = await readHead(gitDir);
  const parents = parentHash ? [parentHash] : [];
  
  // Tạo commit object
  const now = Math.floor(Date.now() / 1000);
  const commit = new CommitObject({
    tree: treeHash,
    parents,
    author: {
      name: author?.name || 'Unknown',
      email: author?.email || 'unknown@example.com',
      timestamp: now,
      timezone: '+0000',
    },
    committer: {
      name: author?.name || 'Unknown',
      email: author?.email || 'unknown@example.com',
      timestamp: now,
      timezone: '+0000',
    },
    message,
  });
  
  const commitHash = await storage.store(commit);
  
  // Cập nhật HEAD và branch
  const currentBranch = await getCurrentBranch(gitDir) || 'main';
  await writeRef(gitDir, `refs/heads/${currentBranch}`, commitHash);
  await setHeadToBranch(gitDir, currentBranch);
  
  console.log(`[${currentBranch} ${commitHash.substring(0, 7)}] ${message}`);
}

