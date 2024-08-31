import ExtendableError from 'ts-error';

export class ConfirmationDuplicateException extends ExtendableError {
  constructor() {
    super('CONFIRMATION_DUPLICATE');
  }
}
