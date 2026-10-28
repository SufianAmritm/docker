import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Database } from './database/database';

describe('AppController', () => {
  let appController: AppController;
  const database = { health: jest.fn() };

  beforeEach(async () => {
    database.health.mockReset();

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, { provide: Database, useValue: database }],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return the health status', () => {
      expect(appController.health()).toEqual({ status: 'ok' });
    });
  });

  describe('ready', () => {
    it('should return ready when the database is healthy', async () => {
      database.health.mockResolvedValue(true);

      await expect(appController.ready()).resolves.toEqual({ status: 'ready' });
    });

    it('should return not-ready when the database is unhealthy', async () => {
      database.health.mockResolvedValue(false);

      await expect(appController.ready()).resolves.toEqual({
        status: 'not-ready',
      });
    });

    it('should propagate unexpected database errors', async () => {
      database.health.mockRejectedValue(new Error('boom'));

      await expect(appController.ready()).rejects.toThrow('boom');
    });
  });
});
