import * as fs from 'fs/promises';
import * as path from 'path';
import { sha1, hashToBuffer } from './hash';
import { compress, decompress } from './compression';

export enum ObjectType {
  BLOB = 'blob',
  TREE = 'tree',
  COMMIT = 'commit',
}

/**
 * Git Object base class
 */
export abstract class GitObject {
  abstract type: ObjectType;
  abstract content: Buffer | string;

  /**
   * Tạo header cho object: "type size\0"
   */
  getHeader(): string {
    const size = typeof this.content === 'string' 
      ? Buffer.byteLength(this.content) 
      : this.content.length;
    return `${this.type} ${size}\0`;
  }

  /**
   * Serialize object thành buffer
   */
  serialize(): Buffer {
    const header = this.getHeader();
    const content = typeof this.content === 'string' 
      ? Buffer.from(this.content) 
      : this.content;
    return Buffer.concat([Buffer.from(header), content]);
  }

  /**
   * Tính hash của object
   */
  getHash(): string {
    return sha1(this.serialize().toString('binary'));
  }

  /**
   * Lưu object vào .git/objects/
   */
  async save(gitDir: string): Promise<string> {
    const hash = this.getHash();
    const objectDir = path.join(gitDir, 'objects', hash.substring(0, 2));
    const objectFile = path.join(objectDir, hash.substring(2));

    // Tạo thư mục nếu chưa tồn tại
    await fs.mkdir(objectDir, { recursive: true });

    // Nén và lưu
    const serialized = this.serialize();
    const compressed = await compress(serialized);
    await fs.writeFile(objectFile, compressed);

    return hash;
  }
}

/**
 * Blob Object - lưu trữ nội dung file
 */
export class BlobObject extends GitObject {
  type = ObjectType.BLOB;
  content: Buffer;

  constructor(content: Buffer) {
    super();
    this.content = content;
  }

  static fromString(content: string): BlobObject {
    return new BlobObject(Buffer.from(content));
  }
}

/**
 * Tree Entry - một entry trong tree object
 */
export interface TreeEntry {
  mode: string;      // File mode (100644, 100755, 040000)
  name: string;      // File/directory name
  hash: string;      // SHA-1 hash của object con
}

/**
 * Tree Object - lưu trữ cấu trúc thư mục
 */
export class TreeObject extends GitObject {
  type = ObjectType.TREE;
  entries: TreeEntry[];

  constructor(entries: TreeEntry[]) {
    super();
    this.entries = entries;
  }

  get content(): Buffer {
    const parts: Buffer[] = [];
    for (const entry of this.entries) {
      const mode = Buffer.from(entry.mode + ' ');
      const name = Buffer.from(entry.name);
      const nullByte = Buffer.from([0]);
      const hash = hashToBuffer(entry.hash);
      parts.push(Buffer.concat([mode, name, nullByte, hash]));
    }
    return Buffer.concat(parts);
  }
}

/**
 * Commit Object - lưu trữ metadata của commit
 */
export interface CommitMetadata {
  tree: string;              // Hash của tree object
  parents: string[];         // Hash của parent commits
  author: {
    name: string;
    email: string;
    timestamp: number;
    timezone: string;
  };
  committer: {
    name: string;
    email: string;
    timestamp: number;
    timezone: string;
  };
  message: string;
}

export class CommitObject extends GitObject {
  type = ObjectType.COMMIT;
  metadata: CommitMetadata;

  constructor(metadata: CommitMetadata) {
    super();
    this.metadata = metadata;
  }

  get content(): string {
    const lines: string[] = [];
    
    lines.push(`tree ${this.metadata.tree}`);
    
    for (const parent of this.metadata.parents) {
      lines.push(`parent ${parent}`);
    }
    
    lines.push(`author ${this.formatPerson(this.metadata.author)}`);
    lines.push(`committer ${this.formatPerson(this.metadata.committer)}`);
    lines.push('');
    lines.push(this.metadata.message);

    return lines.join('\n');
  }

  private formatPerson(person: CommitMetadata['author']): string {
    return `${person.name} <${person.email}> ${person.timestamp} ${person.timezone}`;
  }
}

/**
 * Đọc object từ .git/objects/
 */
export async function readObject(gitDir: string, hash: string): Promise<GitObject> {
  const objectDir = path.join(gitDir, 'objects', hash.substring(0, 2));
  const objectFile = path.join(objectDir, hash.substring(2));
  
  const compressed = await fs.readFile(objectFile);
  const decompressed = await decompress(compressed);
  
  // Parse header: "type size\0"
  const nullIndex = decompressed.indexOf(0);
  const header = decompressed.subarray(0, nullIndex).toString();
  const [type, sizeStr] = header.split(' ');
  const size = parseInt(sizeStr, 10);
  
  const content = decompressed.subarray(nullIndex + 1, nullIndex + 1 + size);
  
  switch (type) {
    case 'blob':
      return new BlobObject(content);
    case 'tree':
      // TODO: Parse tree entries
      throw new Error('Tree parsing not yet implemented');
    case 'commit':
      // TODO: Parse commit metadata
      throw new Error('Commit parsing not yet implemented');
    default:
      throw new Error(`Unknown object type: ${type}`);
  }
}

