import { LocalImageStorage } from '../../../src/application';
import { writeFile } from 'fs/promises';
import { join } from 'path';

// mock join and writefile methods
jest.mock('path', () => ({
  join: jest.fn(),
}));
jest.mock('fs/promises', () => ({
  writeFile: jest.fn(),
}));

describe('LocalImageStorageService', () => {
  it('should save an image locally', async () => {
    const fileStorage = new LocalImageStorage();
    const base64 = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABrElEQVR42mNkAAYy';

    const mimeType = 'image/png';
    const filePath = 'path/to/file';

    // mock join method
    (join as jest.Mock).mockReturnValue(filePath);

    await fileStorage.saveImage(base64, mimeType);

    expect(writeFile).toHaveBeenCalledWith(filePath, base64, 'base64');
  });

  it.each(['iVBORw0KGgoAAAANSUhE', '/9j/', 'data:image/webp;base64,', 'U'])(
    'should return the correct mime type for %s',
    signature => {
      const fileStorage = new LocalImageStorage();
      const base64 = signature + 'gAAABAAAAAQCAYAAAAf8/9hAAABrElEQVR42mNkAAYy';

      const mimeType = fileStorage.getImageMimeType(base64);

      expect(mimeType).not.toBeNull();
    },
  );

  it('should return null if no match is found', () => {
    const fileStorage = new LocalImageStorage();
    const base64 = 'invalidBase64';

    const mimeType = fileStorage.getImageMimeType(base64);

    expect(mimeType).toBeNull();
  });
});
