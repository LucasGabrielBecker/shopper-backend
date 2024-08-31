import { randomUUID } from 'crypto';
import { MeasureType } from '../../../src/domain/interfaces';
import { Measure } from '../../../src/domain/measure';

describe('Measure domain', () => {
  it('Should call createMeasureId if no id provided', () => {
    const measure = {
      customer_code: '1231',
      image_url: '',
      value: 10,
      measure_datetime: new Date(),
      measure_type: MeasureType.WATER,
      has_confirmed: false,
    };
    const measureSpy = jest.spyOn<any, string>(Measure, 'createMeasureId');
    new Measure(measure);
    expect(measureSpy).toHaveBeenCalled();
    measureSpy.mockClear();
  });

  it('Should not call createMeasureId if id provided', () => {
    const measure = {
      id: randomUUID(),
      customer_code: '1231',
      image_url: '',
      value: 10,
      measure_datetime: new Date(),
      measure_type: MeasureType.WATER,
      has_confirmed: false,
    };
    const measureSpy = jest.spyOn<any, string>(Measure, 'createMeasureId');
    new Measure(measure);
    expect(measureSpy).not.toHaveBeenCalled();
    measureSpy.mockClear();
  });
});
