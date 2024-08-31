import { GenerativeModel } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import { ILLMService } from '../domain/interfaces';
import { join } from 'path';

export class LLMService implements ILLMService {
  constructor(
    private readonly model: GenerativeModel,
    private readonly fileManager: GoogleAIFileManager,
  ) {}
  async getMeasureFromImage(filename: string): Promise<number> {
    const prompt =
      'You are an image processing specialist with expertise in extracting numerical values from images. I will provide you with a base64-encoded image of a gas measurement device. Your task is to extract and return only the numerical value displayed on the device. Ensure that you always output a value and only one, even if it requires estimation or interpolation. Output the value and nothing else.';

    const fileUri = await this.uploadImage(filename);
    const imagePart = {
      fileData: {
        fileUri,
        mimeType: `image/${filename.split('.')[1]}`,
      },
    };
    const result = await this.model.generateContent([prompt, imagePart]);
    return JSON.parse(result.response.text()).value;
  }

  private async uploadImage(filename: string): Promise<string> {
    const filePath = join(process.cwd(), 'public', filename);
    const response = await this.fileManager.uploadFile(filePath, {
      mimeType: `image/${filename.split('.')[1]}`,
    });

    return response.file.uri;
  }
}
