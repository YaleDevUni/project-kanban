import { Controller, Get } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
@Controller('health')
export class HealthController {
  constructor(private readonly orm: MikroORM) {}

  @Get('db')
  @ApiTags('Health')
  @ApiOperation({
    summary: 'Database Health Check',
    description: 'Check the connectivity status of the database.',
  })
  @ApiResponse({
    status: 200,
    description: 'Database is connected successfully.',
  })
  @ApiResponse({ status: 500, description: 'Database connection failed.' })
  async checkDb() {
    await this.orm.em.getConnection().execute('SELECT 1');
    return {
      status: 'ok',
      database: 'connected',
    };
  }
}
