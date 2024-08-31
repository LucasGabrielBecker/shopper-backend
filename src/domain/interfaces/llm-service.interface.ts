export interface ILLMService {
  getMeasureFromImage(base64: string): Promise<number>;
}
