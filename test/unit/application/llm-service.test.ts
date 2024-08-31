import { GenerativeModel } from '@google/generative-ai';
import { LLMService } from '../../../src/application';
import { GoogleAIFileManager } from '@google/generative-ai/server';

describe('LLMService', () => {
  const mockedModel: GenerativeModel = {
    generateContent: jest.fn().mockResolvedValue({
      response: { text: jest.fn().mockReturnValue(JSON.stringify({ value: 1 })) },
    }),
  } as unknown as GenerativeModel; // here we mock only the method we use

  const mockedFileManager: GoogleAIFileManager = {
    uploadFile: jest.fn().mockResolvedValue({ file: { uri: 'some_file_uri.png' } }),
    deleteFile: jest.fn(),
    downloadFile: jest.fn(),
  } as unknown as GoogleAIFileManager;

  describe('Valid scenarios', () => {
    it('should return a number when the image is uploaded', async () => {
      const llmService = new LLMService(mockedModel, mockedFileManager);
      const result = await llmService.getMeasureFromImage('image.png');

      expect(result).toBe(1);
    });
  });

  it('should call upload image with the correct filename', async () => {
    const llmService = new LLMService(mockedModel, mockedFileManager);
    await llmService.getMeasureFromImage('image.png');

    expect(mockedFileManager.uploadFile).toHaveBeenCalledWith(
      expect.stringContaining('image.png'),
      expect.any(Object),
    );
  });
});
