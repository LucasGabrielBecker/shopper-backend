import { PrismaClient } from '@prisma/client';
import { DatabaseModule } from './infraestructure/db/database.module';
import { HealthCheckController } from './handlers/controllers/health-check.controller';
import { Server } from 'http';
import { ILogger, IMeasureRepository } from './domain/interfaces';
import express from 'express';
import helmet from 'helmet';
import { MeasureMapper } from './infraestructure/db/mappers';
import { LocalImageStorage, MeasureService } from './application';
import { MeasureRepository } from './infraestructure/db/repositories';
import { MeasureController } from './handlers/controllers/v1';
import { LLMService } from './application/llm-service';
import { GenerativeModel, GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import path from 'path';

export class AppModule {
  private readonly module = 'AppModule';
  private prismaClient?: PrismaClient;
  private databaseModule?: DatabaseModule;
  private healthCheckController?: HealthCheckController;
  private server?: Server;
  private measureMapper?: MeasureMapper;
  private measureService?: MeasureService;
  private measureRepository?: IMeasureRepository;
  private measureController?: MeasureController;
  private model?: GenerativeModel;
  private llmService?: LLMService;
  private fileManager?: GoogleAIFileManager;
  private localImageStorage?: LocalImageStorage;

  constructor(private readonly logger: ILogger) {}

  public async start(): Promise<void> {
    this.logger.info('Starting application', { module: this.module });
    this.prismaClient = new PrismaClient();
    this.databaseModule = new DatabaseModule(this.prismaClient);
    await this.databaseModule.connect();
    this.healthCheckController = new HealthCheckController();
    this.measureMapper = new MeasureMapper();
    this.measureRepository = new MeasureRepository(this.prismaClient, this.measureMapper);
    const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    this.model = genai.getGenerativeModel({
      model: 'gemini-1.5-pro',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          description: 'The response object',
          example: 0.5,
          properties: {
            value: {
              type: SchemaType.NUMBER,
              description: 'The measure of the object in the image',
              example: 0.5,
            },
          },
          required: ['value'],
        },
      },
    });
    this.fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY!);
    this.llmService = new LLMService(this.model, this.fileManager);
    this.localImageStorage = new LocalImageStorage();
    this.measureService = new MeasureService(
      this.measureRepository,
      this.llmService,
      this.localImageStorage,
    );

    this.measureController = new MeasureController(
      this.logger,
      this.measureService,
      this.measureMapper,
    );
    const port = parseInt(process.env.PORT ?? '3333', 10);
    const app = express();
    // app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.json());
    app.use(helmet());
    app.disable('x-powered-by');

    app.use('/healthz', this.healthCheckController.router);
    app.use('/', this.measureController.router);
    app.get('/public/:imagename', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'public', req.params.imagename));
    });
    this.server = app.listen(port, () => {
      this.logger.info(`Server listening on port ${port}`, { module: this.module });
    });

    return;
  }

  public async stop(): Promise<void> {
    if (this.server) {
      try {
        await this.server.close(async () => {
          this.logger.info('Server stopped', { module: this.module });

          if (this.databaseModule) {
            /** Disconnect the Prisma client */
            await this.databaseModule.disconnect();
          }
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error stopping server';
        this.logger.error(errorMessage, { module: this.module, originalError: error });
        throw error;
      }
    }

    throw new Error('Server not started');
  }
}
