import { randomUUID } from 'crypto';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export class LocalImageStorage {
  async saveImage(base64: string, mimeType: string): Promise<string> {
    const filename = `${randomUUID()}.${mimeType.split('/')[1]}`;
    const filePath = join(process.cwd(), 'public', filename);
    await writeFile(filePath, base64, 'base64');
    return filename;
  }

  getImageMimeType(base64: string): string | null {
    const signatures = {
      iVBORw0KGgo: 'image/png', // PNG
      '/9j/': 'image/jpeg', // JPEG
      'data:image/webp;base64,': 'image/webp', // WEBP
      U: 'image/webp', // WEBP
    } as const;

    for (const signature in signatures) {
      if (base64.startsWith(signature)) {
        return signatures[signature as keyof typeof signatures];
      }
    }

    return null; // Return null if no match is found
  }
}
