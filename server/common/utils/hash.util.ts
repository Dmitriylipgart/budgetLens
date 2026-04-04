import * as crypto from 'crypto';
import * as fs from 'fs';

export function hashFile(filePath: string): string {
  const buffer = fs.readFileSync(filePath);
  return hashBuffer(buffer);
}

export function hashBuffer(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}
