import ExtendableError from 'ts-error';

export class DoubleReportException extends ExtendableError {
  constructor() {
    super('Leitura do mês já realizada');
  }
}
