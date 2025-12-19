import * as zlib from 'zlib';
import { promisify } from 'util';

const deflate = promisify(zlib.deflate);
const inflate = promisify(zlib.inflate);

/**
 * Nén dữ liệu sử dụng zlib (Git sử dụng deflate)
 */
export async function compress(data: Buffer): Promise<Buffer> {
  return await deflate(data);
}

/**
 * Giải nén dữ liệu
 */
export async function decompress(data: Buffer): Promise<Buffer> {
  return await inflate(data);
}

