import * as fs from 'fs/promises';
import * as path from 'path';
import { GitObject } from './object';

/**
 * Quản lý storage của Git objects
 */
export class ObjectStorage {
  constructor(private gitDir: string) {}

  /**
   * Lưu object và trả về hash
   */
  async store(object: GitObject): Promise<string> {
    return await object.save(this.gitDir);
  }

  /**
   * Kiểm tra object có tồn tại không
   */
  async exists(hash: string): Promise<boolean> {
    const objectDir = path.join(this.gitDir, 'objects', hash.substring(0, 2));
    const objectFile = path.join(objectDir, hash.substring(2));
    
    try {
      await fs.access(objectFile);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Đọc object từ storage
   */
  async read(hash: string): Promise<GitObject> {
    const { readObject } = await import('./object');
    return await readObject(this.gitDir, hash);
  }
}

