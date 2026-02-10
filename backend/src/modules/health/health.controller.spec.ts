import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { MikroORM } from '@mikro-orm/core';

describe('HealthController', () => {
  let controller: HealthController;
  let orm: MikroORM;

  beforeEach(async () => {
    orm = {
      em: {
        getConnection: () => ({
          execute: jest.fn().mockResolvedValueOnce(true),
        }),
      },
    } as unknown as MikroORM;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: MikroORM,
          useValue: orm,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return "ok" for checkDb', async () => {
    expect(await controller.checkDb()).toEqual({
      status: 'ok',
      database: 'connected',
    });
  });
});
