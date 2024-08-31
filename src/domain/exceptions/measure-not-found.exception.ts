import ExtendableError from 'ts-error';

export class MeasureNotFoundException extends ExtendableError {
  constructor() {
    super('MEASURE_NOT_FOUND');
  }
}
