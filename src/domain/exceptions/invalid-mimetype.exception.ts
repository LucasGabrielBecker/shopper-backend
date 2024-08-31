import ExtendableError from 'ts-error';

export class InvalidMimeTypeException extends ExtendableError {
  constructor() {
    super('Invalid image mime type. Supported types are PNG, JPEG, HEIC, HEIF and WEBP.');
  }
}
