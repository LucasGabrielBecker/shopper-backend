import { IMeasure, MeasureType } from './measure';

export interface IMeasureRepository {
  createMeasure(data: IMeasure): Promise<IMeasure>;
  findMeasureById(measure_uuid: string): Promise<IMeasure | null>;
  findMeasuresByCustomerCode(
    customer_code: string,
    measure_type?: MeasureType,
  ): Promise<IMeasure[]>;
  findExistingMeasureInMonth(
    customer_code: string,
    measure_type: MeasureType,
    date: Date,
  ): Promise<IMeasure | null>;
  confirmMeasure(measure_uuid: string, confirmed_value: number): Promise<IMeasure>;
}
