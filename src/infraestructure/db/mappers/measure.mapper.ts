import { Measure, Customer } from '@prisma/client';
import { IMeasure, MeasureType } from '../../../domain/interfaces';
import { Measure as MeasureDomain } from '../../../domain/measure';
type MeasureWithCustomer = Measure & { customer: Customer };

export class MeasureMapper {
  public toOutputDto(data: IMeasure) {
    return {
      measure_uuid: data.id,
      measure_datetime: data.measure_datetime,
      measure_type: data.measure_type,
      measure_value: data.value,
      image_url: `http://localhost:80/public/${data.image_url}`,
      customer_code: data.customer_code,
    };
  }

  public toDomain(data: MeasureWithCustomer): MeasureDomain {
    return new MeasureDomain({
      id: data.id,
      image_url: data.image_url,
      customer_code: data.customer.customer_code,
      value: data.measure_value,
      measure_datetime: data.measure_datetime,
      measure_type: data.measure_type as MeasureType,
      has_confirmed: data.has_confirmed,
      customer_id: data.customer_id,
    });
  }

  public toDatabase(data: MeasureDomain): Omit<Measure, 'customer_id'> {
    return {
      has_confirmed: false,
      measure_datetime: new Date(data.measure_datetime),
      measure_type: data.measure_type,
      measure_value: data.value,
      id: data.id,
      image_url: data.image_url,
    };
  }
}
