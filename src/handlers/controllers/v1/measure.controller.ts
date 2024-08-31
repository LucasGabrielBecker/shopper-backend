import { Request, Response, Router } from 'express';
import { InvalidMimeTypeException } from '../../../domain/exceptions';
import { ILogger } from '../../../domain/interfaces';
import { validateDTO, createMeasureSchema, confirmMeasureSchema } from './resources';
import { MeasureService } from '../../../application';
import { MeasureMapper } from '../../../infraestructure/db/mappers';
import { DoubleReportException } from '../../../domain/exceptions';
import { MeasureNotFoundException } from '../../../domain/exceptions/measure-not-found.exception';

export class MeasureController {
  private readonly module = this.constructor.name;
  private readonly model = 'measure';

  public readonly router: Router;

  constructor(
    private readonly logger: ILogger,
    private readonly service: MeasureService,
    private readonly mapper: MeasureMapper,
  ) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    this.router.get('/:customer_code/list', async (request: Request, response: Response) => {
      try {
        const { customer_code } = request.params;
        this.logger.info(`List ${this.model} by customer code endpoint called`, {
          module: this.module,
          customer_code,
        });
        const measures = await this.service.findMeasuresByCustomerCode(customer_code as string);
        const output = {
          customer_code,
          measures: measures.map(this.mapper.toOutputDto),
        };
        return response.status(200).json(output);
      } catch (error) {
        this.logger.error(`Error listing measures: ${(error as Error).message}`, {
          module: this.module,
          originalError: error,
        });
        return response.status(500).json('Internal Server Error');
      }
    });

    this.router.post(
      '/upload',
      validateDTO(createMeasureSchema),
      async (request: Request, response: Response) => {
        this.logger.info(`Create ${this.model} endpoint called`, {
          module: this.module,
          input: { ...request.body, image: '<<base64>>' },
        });
        try {
          const measure = await this.service.createMeasure(request.body);
          return response.status(201).json(this.mapper.toOutputDto(measure));
        } catch (error) {
          this.logger.error(`Error creating measure: ${(error as Error).message}`, {
            module: this.module,
            originalError: error,
          });

          if (error instanceof InvalidMimeTypeException) {
            return response.status(400).json({
              error_code: 'INVALID_DATA',
              error_description: error.message,
            });
          }
          if (error instanceof DoubleReportException) {
            return response.status(409).json({
              error_code: 'DOUBLE_REPORT',
              error_description: error.message,
            });
          }

          return response.status(500).json('Internal Server Error');
        }
      },
    );

    this.router.patch(
      '/confirm',
      validateDTO(confirmMeasureSchema),
      async (request: Request, response: Response) => {
        this.logger.info(`Confirm ${this.model} endpoint called`, {
          module: this.module,
          input: request.body,
        });
        try {
          await this.service.confirmMeasure(
            request.body.measure_uuid,
            request.body.confirmed_value,
          );
          return response.status(200).json({ success: true });
        } catch (error) {
          this.logger.error(`Error confirming measure: ${(error as Error).message}`, {
            module: this.module,
            originalError: error,
          });

          if (error instanceof MeasureNotFoundException) {
            return response.status(404).json({
              error_code: error.message,
            });
          }

          return response.status(500).json('Internal Server Error');
        }
      },
    );
  }
}
