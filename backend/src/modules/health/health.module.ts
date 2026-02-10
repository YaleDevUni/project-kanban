import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';

@Module({
  imports: [MikroOrmModule],
  controllers: [HealthController],
})
export class HealthModule {}
