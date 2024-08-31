import { PrismaClient as Client, Customer, Measure as MeasureDatabase } from '@prisma/client';
import { MeasureType } from '../../../../src/domain/interfaces';
import { mockDeep } from 'jest-mock-extended';
import { Measure } from '../../../../src/domain/measure';
import { MeasureMapper } from '../../../../src/infraestructure/db/mappers';
import { MeasureRepository } from '../../../../src/infraestructure/db/repositories';
import { randomUUID } from 'crypto';
describe('Measure repository', () => {
  let prismaClient = mockDeep<Client>();
  const measureMapper = new MeasureMapper();
  const measureRepository = new MeasureRepository(prismaClient, measureMapper);

  it('should call the create method with correct parameters', async () => {
    const measureId = randomUUID();
    const measureDate = new Date().toISOString();
    const measure: Measure = {
      measure_datetime: measureDate,
      measure_type: MeasureType.WATER,
      value: 1,
      image_url: 'http://test.com',
      customer_code: '123',
      has_confirmed: false,
      id: measureId,
    };

    prismaClient.measure.create.mockResolvedValueOnce({
      has_confirmed: false,
      image_url: 'http://test.com',
      measure_datetime: new Date(measureDate),
      measure_type: MeasureType.WATER,
      measure_value: 1,
      id: measureId,
      customer_id: '123',
      customer: {
        customer_code: '123',
        id: '123',
      },
    } as MeasureDatabase & { customer: Customer });
    await measureRepository.createMeasure(measure);

    expect(prismaClient.measure.create).toHaveBeenCalledWith({
      include: { customer: true },
      data: {
        ...measureMapper.toDatabase(measure),
        customer: {
          connectOrCreate: {
            where: { customer_code: measure.customer_code },
            create: { customer_code: measure.customer_code },
          },
        },
      },
    });
  });

  it('should call findMeasuresByCustomerCode with correct parameters', async () => {
    prismaClient.measure.findMany.mockResolvedValueOnce([]);
    await measureRepository.findMeasuresByCustomerCode('123', MeasureType.WATER);

    expect(prismaClient.measure.findMany).toHaveBeenCalledWith({
      where: {
        customer: {
          customer_code: '123',
        },
        measure_type: MeasureType.WATER,
      },
      include: {
        customer: true,
      },
    });
  });

  it('should call findExistingMeasureInMonth with correct parameters', async () => {
    const date = new Date();
    prismaClient.measure.findFirst.mockResolvedValueOnce(null);
    await measureRepository.findExistingMeasureInMonth('123', MeasureType.WATER, date);

    expect(prismaClient.measure.findFirst).toHaveBeenCalledWith({
      include: { customer: true },
      where: {
        customer: {
          customer_code: '123',
        },
        measure_type: MeasureType.WATER,
        measure_datetime: {
          gte: new Date(date.getFullYear(), date.getMonth(), 1),
          lte: new Date(date.getFullYear(), date.getMonth() + 1, 0),
        },
      },
    });
  });

  it('should call confirmMeasure with correct parameters', async () => {
    const measureId = randomUUID();
    prismaClient.measure.update.mockResolvedValueOnce({
      has_confirmed: true,
      image_url: 'http://test.com',
      measure_datetime: new Date(),
      measure_type: MeasureType.WATER,
      measure_value: 1,
      id: measureId,
      customer_id: '123',
      customer: {
        customer_code: '123',
        id: '123',
      },
    } as MeasureDatabase & { customer: Customer });
    await measureRepository.confirmMeasure(measureId, 1);

    expect(prismaClient.measure.update).toHaveBeenCalledWith({
      where: { id: measureId },
      data: {
        has_confirmed: true,
        measure_value: 1,
      },
      include: { customer: true },
    });
  });

  it('should return null if measure is not found', async () => {
    prismaClient.measure.findFirst.mockResolvedValueOnce(null);
    const measure = await measureRepository.findMeasureById('123');
    expect(measure).toBeNull();
  });

  it('should return a domain measure instance if measure is found', async () => {
    const measureId = randomUUID();
    prismaClient.measure.findFirst.mockResolvedValueOnce({
      has_confirmed: false,
      image_url: 'http://test.com',
      measure_datetime: new Date(),
      measure_type: MeasureType.WATER,
      measure_value: 1,
      id: measureId,
      customer_id: '123',
      customer: {
        customer_code: '123',
        id: '123',
      },
    } as MeasureDatabase & { customer: Customer });
    const measure = await measureRepository.findMeasureById(measureId);
    expect(measure).toBeInstanceOf(Measure);
  });
});
