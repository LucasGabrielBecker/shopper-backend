import { randomUUID } from 'crypto';
import { Measure } from '../../../../src/domain/measure';
import { MeasureMapper } from '../../../../src/infraestructure/db/mappers';
import { MeasureType } from '../../../../src/domain/interfaces';
import { Customer, Measure as MeasureFromDatabase } from '@prisma/client';

describe('Measure mapper', () => {
  const measureMapper = new MeasureMapper();
  it('should map a measure from the database to a domain object', () => {
    const customerId = randomUUID();
    const measureDateTime = new Date();
    const measure: MeasureFromDatabase & { customer: Customer } = {
      id: randomUUID(),
      measure_value: 1,
      measure_datetime: measureDateTime,
      measure_type: MeasureType.WATER,
      image_url: 'http://test.com',
      has_confirmed: false,
      customer_id: customerId,
      customer: {
        customer_code: '123',
        id: customerId,
      },
    };

    const result = measureMapper.toDomain(measure);

    expect(result).toBeInstanceOf(Measure);
    expect(result.id).toBe(measure.id);
    expect(result.value).toBe(measure.measure_value);
    expect(result.measure_datetime).toBe(measureDateTime.toISOString());
    expect(result.measure_type).toBe(measure.measure_type);
    expect(result.image_url).toBe(measure.image_url);
    expect(result.has_confirmed).toBe(measure.has_confirmed);
    expect(result.customer_id).toBe(customerId);
  });

  it('should map a measure from the domain to a database object', () => {
    const measureDatetime = new Date();
    const measure: Measure = {
      id: randomUUID(),
      customer_code: '123',
      value: 1,
      measure_datetime: measureDatetime.toISOString(),
      measure_type: MeasureType.WATER,
      image_url: 'http://test.com',
      has_confirmed: false,
    };

    const result = measureMapper.toDatabase(measure);

    expect(result.id).toBe(measure.id);
    expect(result.measure_value).toBe(measure.value);
    expect(result.measure_datetime).toStrictEqual(measureDatetime);
    expect(result.measure_type).toBe(measure.measure_type);
    expect(result.image_url).toBe(measure.image_url);
    expect(result.has_confirmed).toBe(measure.has_confirmed);
  });

  it('should map a measure from the domain to an output dto', () => {
    const measureDatetime = new Date();
    const measure: Measure = {
      id: randomUUID(),
      customer_code: '123',
      value: 1,
      measure_datetime: measureDatetime.toISOString(),
      measure_type: MeasureType.WATER,
      image_url: 'some_file_name.png',
      has_confirmed: false,
    };

    const result = measureMapper.toOutputDto(measure);

    expect(result.measure_uuid).toBe(measure.id);
    expect(result.measure_value).toBe(measure.value);
    expect(result.measure_datetime).toBe(measureDatetime.toISOString());
    expect(result.measure_type).toBe(measure.measure_type);
    expect(result.image_url).toBe('http://localhost:80/public/some_file_name.png');
    expect(result.customer_code).toBe(measure.customer_code);
  });
});
