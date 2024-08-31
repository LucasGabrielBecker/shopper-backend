import express from 'express';
import { Server } from 'http';
import { HealthCheckController } from '../../../../src/handlers/controllers';
import request from 'supertest';

describe('HealthCheckController', () => {
  let app: express.Application;
  let server: Server;

  beforeEach(() => {
    const controller = new HealthCheckController();

    app = express();
    app.use(express.json());
    app.use('/healthz', controller.router);
    server = app.listen();
  });

  afterEach(() => {
    server.close();
    server.unref();
  });

  describe('GET /', () => {
    it('should return 200 (OK) on success', async () => {
      const result = await request(server).get('/healthz').expect(200);
      expect(result.body).toBe('Measure management System using Domain-Driven Design (DDD).');
    });
  });
});
