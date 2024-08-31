import { mock } from 'jest-mock-extended';

import { LocalImageStorage, MeasureService } from '../../../src/application';
import {
  ILLMService,
  IMeasure,
  IMeasureRepository,
  MeasureType,
} from '../../../src/domain/interfaces';
import { randomUUID } from 'crypto';

describe('MeasureService', () => {
  let measureService: MeasureService;
  let measureRepository = mock<IMeasureRepository>();
  let llmService = mock<ILLMService>();
  let localImageStorage = mock<LocalImageStorage>();

  beforeEach(() => {
    measureService = new MeasureService(measureRepository, llmService, localImageStorage);
  });

  it('should create a measure', async () => {
    const input = {
      customer_code: 'customer_code',
      measure_type: MeasureType.WATER,
      measure_datetime: new Date().toISOString(),
      image: 'base64',
    };

    const filename = 'filename';
    const result = 1;
    const measure: IMeasure = {
      id: 'id',
      customer_code: 'customer_code',
      measure_type: MeasureType.WATER,
      measure_datetime: new Date().toISOString(),
      value: 1,
      has_confirmed: false,
      image_url: 'image_url',
    };

    localImageStorage.getImageMimeType.mockReturnValue('image/png');
    localImageStorage.saveImage.mockResolvedValue(filename);
    llmService.getMeasureFromImage.mockResolvedValue(result);
    measureRepository.findExistingMeasureInMonth.mockResolvedValue(null);
    measureRepository.createMeasure.mockResolvedValue(measure);

    await measureService.createMeasure(input);

    expect(localImageStorage.getImageMimeType).toHaveBeenCalledWith(input.image);
    expect(localImageStorage.saveImage).toHaveBeenCalledWith(input.image, 'image/png');
    expect(llmService.getMeasureFromImage).toHaveBeenCalledWith(filename);
    expect(measureRepository.createMeasure).toHaveBeenCalledWith(expect.anything());
  });

  it('should throw an error if the image mime type is invalid', async () => {
    const input = {
      customer_code: 'customer_code',
      measure_type: MeasureType.WATER,
      measure_datetime: new Date().toISOString(),
      image: 'base64',
    };

    measureRepository.findExistingMeasureInMonth.mockResolvedValue(null);
    localImageStorage.getImageMimeType.mockReturnValue(null);

    await expect(measureService.createMeasure(input)).rejects.toThrow(
      'Invalid image mime type. Supported types are PNG, JPEG, HEIC, HEIF and WEBP.',
    );
  });

  it('should throw an error if a measure has already been created in the same month', async () => {
    const input = {
      customer_code: 'customer_code',
      measure_type: MeasureType.WATER,
      measure_datetime: new Date().toISOString(),
      image: 'base64',
    };

    measureRepository.findExistingMeasureInMonth.mockResolvedValue({
      customer_code: 'customer_code',
      measure_type: MeasureType.WATER,
      measure_datetime: new Date().toISOString(),
      value: 1,
      has_confirmed: false,
      image_url: 'image_url',
      id: randomUUID(),
    });

    await expect(measureService.createMeasure(input)).rejects.toThrow(
      'Leitura do mês já realizada',
    );
  });

  it('should throw an error if the measure is not found', async () => {
    const measure_uuid = 'measure_uuid';
    const confirmed_value = 1;

    measureRepository.findMeasureById.mockResolvedValue(null);

    await expect(measureService.confirmMeasure(measure_uuid, confirmed_value)).rejects.toThrow(
      'MEASURE_NOT_FOUND',
    );
  });

  it('should confirm a measure correctly', async () => {
    const measure_uuid = 'measure_uuid';
    const confirmed_value = 1;
    const measure: IMeasure = {
      id: 'id',
      customer_code: 'customer_code',
      measure_type: MeasureType.WATER,
      measure_datetime: new Date().toISOString(),
      value: 1,
      has_confirmed: false,
      image_url: 'image_url',
    };

    measureRepository.findMeasureById.mockResolvedValue(measure);
    measureRepository.confirmMeasure.mockResolvedValue(measure);

    const result = await measureService.confirmMeasure(measure_uuid, confirmed_value);

    expect(result).toEqual(measure);
  });

  it('should find measures by customer code', async () => {
    const customer_code = 'customer_code';
    const measure_type = MeasureType.WATER;
    const measures: IMeasure[] = [
      {
        id: 'id',
        customer_code: 'customer_code',
        measure_type: MeasureType.WATER,
        measure_datetime: new Date().toISOString(),
        value: 1,
        has_confirmed: false,
        image_url: 'image_url',
      },
    ];

    measureRepository.findMeasuresByCustomerCode.mockResolvedValue(measures);

    const result = await measureService.findMeasuresByCustomerCode(customer_code, measure_type);

    expect(result).toEqual(measures);
    expect(measureRepository.findMeasuresByCustomerCode).toHaveBeenCalledWith(
      customer_code,
      measure_type,
    );
  });

  it('should throw an error if the measure is already confirmed', async () => {
    const measure_uuid = 'measure_uuid';
    const confirmed_value = 1;
    const measure: IMeasure = {
      id: 'id',
      customer_code: 'customer_code',
      measure_type: MeasureType.WATER,
      measure_datetime: new Date().toISOString(),
      value: 1,
      has_confirmed: true,
      image_url: 'image_url',
    };

    measureRepository.findMeasureById.mockResolvedValue(measure);

    await expect(measureService.confirmMeasure(measure_uuid, confirmed_value)).rejects.toThrow(
      'CONFIRMATION_DUPLICATE',
    );
  });
});
