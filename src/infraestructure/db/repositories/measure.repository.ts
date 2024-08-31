import { PrismaClient } from '@prisma/client';
import { IMeasure, IMeasureRepository, MeasureType } from '../../../domain/interfaces';
import { MeasureMapper } from '../mappers';
import { Measure } from '../../../domain/measure';

export class MeasureRepository implements IMeasureRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly measureMapper: MeasureMapper,
  ) {}
  async findMeasureById(measure_uuid: string): Promise<IMeasure | null> {
    const measure = await this.prisma.measure.findFirst({
      where: { id: measure_uuid },
      include: { customer: true },
    });

    if (!measure) return null;

    return this.measureMapper.toDomain(measure);
  }
  async createMeasure(data: Measure): Promise<Measure> {
    const measure = await this.prisma.measure.create({
      data: {
        ...this.measureMapper.toDatabase(data),
        customer: {
          connectOrCreate: {
            where: { customer_code: data.customer_code },
            create: { customer_code: data.customer_code },
          },
        },
      },
      include: { customer: true },
    });

    return this.measureMapper.toDomain(measure);
  }

  async findMeasuresByCustomerCode(
    customer_code: string,
    measure_type?: MeasureType,
  ): Promise<Measure[]> {
    const measures = await this.prisma.measure.findMany({
      where: {
        customer: {
          customer_code,
        },
        measure_type: measure_type,
      },
      include: {
        customer: true,
      },
    });
    return measures.map(this.measureMapper.toDomain);
  }
  async findExistingMeasureInMonth(
    customer_code: string,
    measure_type: MeasureType,
    date: Date,
  ): Promise<Measure | null> {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const measures = await this.prisma.measure.findFirst({
      include: { customer: true },
      where: {
        customer: {
          customer_code,
        },
        measure_type,
        measure_datetime: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    return measures ? this.measureMapper.toDomain(measures) : null;
  }
  async confirmMeasure(measure_uuid: string, confirmed_value: number): Promise<Measure> {
    const measure = await this.prisma.measure.update({
      where: { id: measure_uuid },
      data: {
        has_confirmed: true,
        measure_value: confirmed_value,
      },
      include: { customer: true },
    });
    return this.measureMapper.toDomain(measure);
  }
}
