import * as fs from "fs/promises";
import * as path from "path";
import { Stats } from "fs";
import { sha1Buffer } from "../core/hash";

/**
 * Index Entry - một file trong staging area
 */
export interface IndexEntry {
  ctime: { seconds: number; nanoseconds: number };
  mtime: { seconds: number; nanoseconds: number };
  dev: number;
  ino: number;
  mode: number;
  uid: number;
  gid: number;
  size: number;
  hash: string; // SHA-1 hash của file
  flags: number;
  path: string;
}

/**
 * Index - quản lý staging area
 */
export class Index {
  private entries: Map<string, IndexEntry> = new Map();
  private indexPath: string;

  constructor(gitDir: string) {
    this.indexPath = path.join(gitDir, "index");
  }

  /**
   * Thêm file vào index
   */
  async addFile(filePath: string, content: Buffer, stat: Stats): Promise<void> {
    const hash = sha1Buffer(content);

    const entry: IndexEntry = {
      ctime: {
        seconds: Math.floor(stat.ctimeMs / 1000),
        nanoseconds: (stat.ctimeMs % 1000) * 1000000,
      },
      mtime: {
        seconds: Math.floor(stat.mtimeMs / 1000),
        nanoseconds: (stat.mtimeMs % 1000) * 1000000,
      },
      dev: stat.dev,
      ino: stat.ino,
      mode: stat.mode,
      uid: stat.uid,
      gid: stat.gid,
      size: stat.size,
      hash,
      flags: filePath.length, // Simplified
      path: filePath,
    };

    this.entries.set(filePath, entry);
    await this.save();
  }

  /**
   * Xóa file khỏi index
   */
  async removeFile(filePath: string): Promise<void> {
    this.entries.delete(filePath);
    await this.save();
  }

  /**
   * Lấy entry từ index
   */
  getEntry(filePath: string): IndexEntry | undefined {
    return this.entries.get(filePath);
  }

  /**
   * Lấy tất cả entries
   */
  getAllEntries(): IndexEntry[] {
    return Array.from(this.entries.values());
  }

  /**
   * Lưu index ra file
   */
  private async save(): Promise<void> {
    // Simplified version - trong thực tế cần serialize theo format binary
    const data = JSON.stringify(Array.from(this.entries.entries()), null, 2);
    await fs.writeFile(this.indexPath, data, "utf-8");
  }

  /**
   * Đọc index từ file
   */
  async load(): Promise<void> {
    try {
      const data = await fs.readFile(this.indexPath, "utf-8");
      const entries = JSON.parse(data) as [string, IndexEntry][];
      this.entries = new Map(entries);
    } catch {
      // Index chưa tồn tại, khởi tạo rỗng
      this.entries = new Map();
    }
  }

  /**
   * Xóa tất cả entries
   */
  clear(): void {
    this.entries.clear();
  }
}
