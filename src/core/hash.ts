import * as crypto from 'crypto';

/**
 * Tính toán SHA-1 hash của một string
 */
export function sha1(content: string): string {
  return crypto.createHash('sha1').update(content).digest('hex');
}

/**
 * Tạo hash từ buffer
 */
export function sha1Buffer(buffer: Buffer): string {
  return crypto.createHash('sha1').update(buffer).digest('hex');
}

/**
 * Chuyển đổi hash từ hex string sang binary (20 bytes)
 */
export function hashToBuffer(hash: string): Buffer {
  return Buffer.from(hash, 'hex');
}

/**
 * Chuyển đổi hash từ binary sang hex string
 */
export function bufferToHash(buffer: Buffer): string {
  return buffer.toString('hex');
}

