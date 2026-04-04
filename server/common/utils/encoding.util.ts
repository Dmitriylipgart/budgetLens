import * as iconv from 'iconv-lite';

/**
 * Decode a buffer from Windows-1251 (or other encoding) to UTF-8 string.
 * Tries to auto-detect if the content is already UTF-8.
 */
export function decodeBuffer(
  buffer: Buffer,
  encoding: string = 'windows-1251',
): string {
  // Check if content is valid UTF-8 first
  try {
    const utf8 = buffer.toString('utf8');
    // If it contains the BOM or looks like valid UTF-8 with Cyrillic, use it
    if (utf8.includes('Выписка') || utf8.includes('Дата')) {
      return utf8;
    }
  } catch {
    // Not valid UTF-8, proceed with specified encoding
  }

  return iconv.decode(buffer, encoding);
}
