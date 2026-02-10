import { Module, OnModuleInit } from '@nestjs/common'; // OnModuleInit 추가
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './modules/health/health.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { MikroORM } from '@mikro-orm/core'; // MikroORM 타입 추가
import { TaskModule } from './modules/task/task.module';
import { WorkspaceModule } from './modules/workspace/workspace.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    MikroOrmModule.forRootAsync({
      driver: PostgreSqlDriver,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        entities: ['./dist/modules/**/*.entity.js'],
        entitiesTs: ['./src/modules/**/*.entity.ts'],
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT', 5432),
        user: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        dbName: configService.get<string>('DB_NAME'),
        driver: PostgreSqlDriver,
        // schemaGenerator 설정 추가
        schemaGenerator: {
          disableForeignKeys: false,
          createForeignKeyConstraints: true,
        },
        ensureDatabase: true,
        migrations: {
          path: 'dist/migrations',
          pathTs: 'src/migrations',
        },
        debug: true,
      }),
      inject: [ConfigService],
    }),
    HealthModule,
    AuthModule,
    UserModule,
    TaskModule,
    WorkspaceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly orm: MikroORM,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const shouldGenSchema =
      this.configService.get<string>('SCHEMA_GEN') === 'true';

    if (shouldGenSchema) {
      const generator = this.orm.schema;

      await generator.updateSchema();

      console.log('[MikroORM] Database schema has been updated successfully.');
    }
  }
}
