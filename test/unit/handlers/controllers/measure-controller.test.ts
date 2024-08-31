import { mock } from 'jest-mock-extended';
import { MeasureService } from '../../../../src/application';
import { ILogger, IMeasure, MeasureType } from '../../../../src/domain/interfaces';
import { MeasureController } from '../../.././../src/handlers/controllers/v1';
import { MeasureMapper } from '../../../../src/infraestructure/db/mappers';
import express, { Express } from 'express';
import request from 'supertest';
import { randomUUID } from 'crypto';
import { DoubleReportException, InvalidMimeTypeException } from '../../../../src/domain/exceptions';
import { MeasureNotFoundException } from '../../../../src/domain/exceptions/measure-not-found.exception';
describe('MeasureController', () => {
  const measureService = mock<MeasureService>();
  const measureMapper = new MeasureMapper();
  const logger: ILogger = {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
  };
  let app: Express;

  const measureController = new MeasureController(logger, measureService, measureMapper);

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', measureController.router);
  });

  describe('POST /upload', () => {
    it('should return 201 when creating a measure', async () => {
      const payload = {
        image:
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
        customer_code: '91293901239012903',
        measure_datetime: '2025-12-24T13:56:18.959Z',
        measure_type: 'WATER',
      };

      const returnedValue: IMeasure = {
        customer_code: '91293901239012903',
        has_confirmed: false,
        measure_datetime: '2025-12-24T13:56:18.959Z',
        measure_type: MeasureType.WATER,
        value: 0.5,
        id: randomUUID(),
        image_url: 'https://example.com/image.png',
      };
      measureService.createMeasure.mockResolvedValue(returnedValue);
      const mappedOutput = measureMapper.toOutputDto(returnedValue);
      const response = await request(app).post('/upload').send(payload).expect(201);

      expect(response.body.customer_code).toEqual(mappedOutput.customer_code);
      expect(response.body.image_url).toEqual(mappedOutput.image_url);
      expect(response.body.measure_datetime).toEqual(mappedOutput.measure_datetime);
      expect(response.body.measure_type).toEqual(mappedOutput.measure_type);
      expect(response.body.measure_uuid).toEqual(mappedOutput.measure_uuid);
      expect(response.body.measure_value).toEqual(mappedOutput.measure_value);
    });

    it('should return 500 when an error occurs', async () => {
      const payload = {
        image: 'invalidBase64',
        customer_code: '91293901239012903',
        measure_datetime: '2025-12-24T13:56:18.959Z',
        measure_type: 'WATER',
      };
      measureService.createMeasure.mockRejectedValue(new Error('Error'));
      const response = await request(app).post('/upload').send(payload).expect(500);
      expect(response.body).toEqual('Internal Server Error');
    });

    it("should return 400 when the image's mime type is invalid", async () => {
      const payload = {
        image: 'invalidBase64',
        customer_code: '91293901239012903',
        measure_datetime: '2025-12-24T13:56:18.959Z',
        measure_type: 'WATER',
      };
      measureService.createMeasure.mockRejectedValue(new InvalidMimeTypeException());
      const response = await request(app).post('/upload').send(payload).expect(400);
      expect(response.body).toEqual({
        error_code: 'INVALID_DATA',
        error_description:
          'Invalid image mime type. Supported types are PNG, JPEG, HEIC, HEIF and WEBP.',
      });
    });

    it('should return 409 when the measure already exists', async () => {
      const payload = {
        image:
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
        customer_code: '91293901239012903',
        measure_datetime: '2025-12-24T13:56:18.959Z',
        measure_type: 'WATER',
      };
      measureService.createMeasure.mockRejectedValue(new DoubleReportException());
      const response = await request(app).post('/upload').send(payload).expect(409);
      expect(response.body).toEqual({
        error_code: 'DOUBLE_REPORT',
        error_description: 'Leitura do mês já realizada',
      });
    });
  });

  describe('GET /:customer_code/list', () => {
    it('should list measures by customer code', async () => {
      const customer_code = '91293901239012903';
      const returnedValue: IMeasure[] = [
        {
          customer_code: '91293901239012903',
          has_confirmed: true,
          measure_datetime: '2025-12-24T13:56:18.959Z',
          measure_type: MeasureType.WATER,
          value: 0.5,
          id: randomUUID(),
          image_url: 'https://example.com/image.png',
        },
      ];
      measureService.findMeasuresByCustomerCode.mockResolvedValue(returnedValue);
      const response = await request(app).get(`/${customer_code}/list`).expect(200);
      expect(response.body.customer_code).toEqual(customer_code);
      expect(response.body.measures).toEqual(returnedValue.map(measureMapper.toOutputDto));
    });

    it('should list measures by customer code and measure type', async () => {
      const customer_code = '91293901239012903';
      const measureType = MeasureType.WATER;
      const returnedValue: IMeasure[] = [
        {
          customer_code: '91293901239012903',
          has_confirmed: true,
          measure_datetime: '2025-12-24T13:56:18.959Z',
          measure_type: MeasureType.WATER,
          value: 0.5,
          id: randomUUID(),
          image_url: 'https://example.com/image.png',
        },
      ];
      measureService.findMeasuresByCustomerCode.mockResolvedValue(returnedValue);
      const response = await request(app)
        .get(`/${customer_code}/list?measure_type=${measureType}`)
        .expect(200);
      expect(response.body.customer_code).toEqual(customer_code);
      expect(response.body.measures).toEqual(returnedValue.map(measureMapper.toOutputDto));
    });

    it('should return 500 when an error occurs', async () => {
      const customer_code = '91293901239012903';
      measureService.findMeasuresByCustomerCode.mockRejectedValue(new Error('Error'));
      const response = await request(app).get(`/${customer_code}/list`).expect(500);
      expect(response.body).toEqual('Internal Server Error');
      expect(logger.error).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith('Error listing measures: Error', {
        module: 'MeasureController',
        originalError: new Error('Error'),
      });
    });
  });

  describe('PATCH /confirm', () => {
    it('should confirm a measure', async () => {
      const payload = {
        measure_uuid: randomUUID(),
        confirmed_value: 0.5,
      };
      const returnedValue: IMeasure = {
        customer_code: '91293901239012903',
        has_confirmed: true,
        measure_datetime: '2025-12-24T13:56:18.959Z',
        measure_type: MeasureType.WATER,
        value: 0.5,
        id: randomUUID(),
        image_url: 'https://example.com/image.png',
      };
      measureService.confirmMeasure.mockResolvedValue(returnedValue);
      const response = await request(app).patch('/confirm').send(payload).expect(200);
      expect(response.body.success).toBeDefined();
      expect(response.body.success).toBe(true);
    });

    it('should return 400 on invalid body data', async () => {
      const payload = {
        measure_uuid: randomUUID(),
      };
      const response = await request(app).patch('/confirm').send(payload).expect(400);
      expect(response.body.error_code).toBe('INVALID_DATA');
      expect(response.body.error_description).toEqual(expect.any(Array));
    });

    it('should return 500 when an error occurs', async () => {
      const payload = {
        measure_uuid: randomUUID(),
        confirmed_value: 0.5,
      };
      measureService.confirmMeasure.mockRejectedValue(new Error('Error'));
      const response = await request(app).patch(`/confirm`).send(payload).expect(500);
      expect(response.body).toEqual('Internal Server Error');
      expect(logger.error).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith('Error confirming measure: Error', {
        module: 'MeasureController',
        originalError: new Error('Error'),
      });
    });

    it('should return 404 when measure not found', async () => {
      const payload = {
        measure_uuid: randomUUID(),
        confirmed_value: 0.5,
      };
      measureService.confirmMeasure.mockRejectedValue(new MeasureNotFoundException());
      const response = await request(app).patch(`/confirm`).send(payload).expect(404);
      expect(response.body.error_code).toBe('MEASURE_NOT_FOUND');
    });
  });
});
