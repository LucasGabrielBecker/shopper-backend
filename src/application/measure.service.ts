import { InvalidMimeTypeException } from '../domain/exceptions';
import { DoubleReportException } from '../domain/exceptions/double-report.exception';
import { MeasureNotFoundException } from '../domain/exceptions';
import { IMeasureRepository, IMeasure, MeasureType, ILLMService } from '../domain/interfaces';
import { Measure } from '../domain/measure';
import { CreateMeasureDTO } from '../handlers/controllers/v1/resources';
import { LocalImageStorage } from './local-image-storage.service';
import { ConfirmationDuplicateException } from '../domain/exceptions';

export class MeasureService {
  constructor(
    private readonly measureRepository: IMeasureRepository,
    private readonly llmService: ILLMService,
    private readonly localImageStorage: LocalImageStorage,
  ) {}

  async createMeasure(input: CreateMeasureDTO): Promise<IMeasure> {
    const existingMeasure = await this.findExistingMeasureInMonth(
      input.customer_code,
      input.measure_type,
      new Date(input.measure_datetime),
    );

    if (existingMeasure !== null) {
      throw new DoubleReportException();
    }
    const mimeType = this.localImageStorage.getImageMimeType(input.image);
    if (mimeType === null) {
      throw new InvalidMimeTypeException();
    }

    const filename = await this.localImageStorage.saveImage(input.image, mimeType);
    const result = await this.llmService.getMeasureFromImage(filename);
    const measure = await this.measureRepository.createMeasure(
      new Measure({
        customer_code: input.customer_code,
        has_confirmed: false,
        image_url: filename,
        measure_datetime: new Date(input.measure_datetime),
        measure_type: input.measure_type,
        value: result,
      }),
    );
    return measure;
  }

  async findMeasuresByCustomerCode(
    customer_code: string,
    measure_type?: MeasureType,
  ): Promise<IMeasure[]> {
    const measures = await this.measureRepository.findMeasuresByCustomerCode(
      customer_code,
      measure_type,
    );
    return measures;
  }

  async findExistingMeasureInMonth(
    customer_code: string,
    measure_type: MeasureType,
    date: Date,
  ): Promise<IMeasure | null> {
    const measure = await this.measureRepository.findExistingMeasureInMonth(
      customer_code,
      measure_type,
      date,
    );
    return measure;
  }

  async confirmMeasure(measure_uuid: string, confirmed_value: number): Promise<IMeasure> {
    const measure = await this.measureRepository.findMeasureById(measure_uuid);
    if (!measure) {
      throw new MeasureNotFoundException();
    }
    if (measure.has_confirmed) {
      throw new ConfirmationDuplicateException();
    }
    return await this.measureRepository.confirmMeasure(measure_uuid, confirmed_value);
  }
}
