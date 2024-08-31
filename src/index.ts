import 'module-alias/register';
import dotenv from 'dotenv';
import { AppModule } from './app.module';
import { Logger } from './logger.module';
import packageJson from '../package.json';
import { MissingEnvVarException } from './domain/exceptions';

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new MissingEnvVarException('GEMINI_API_KEY environment variable is required');
}
const logger = new Logger(packageJson.name);
const app = new AppModule(logger);
async function main(): Promise<void> {
  await app.start();
}

async function shutdown(): Promise<void> {
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down', {
      module: 'index',
    });

    process.exit(1);
  }, 10000);

  await app.stop();
  process.exit(0);
}

main().catch(error => {
  logger.error(error.message, { module: 'index', originalError: error });
  process.exit(1);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received.', { module: 'index' });
  await shutdown();
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received.', { module: 'index' });
  await shutdown();
});

process.on('uncaughtException', error => {
  logger.error(`Uncaught Exception error caught: ${error.message}`, {
    module: 'index',
    originalError: error,
  });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`, {
    module: 'index',
  });
  process.exit(1);
});
