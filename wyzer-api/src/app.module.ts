import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { LoggerModule } from 'nestjs-pino';
import Redis from 'ioredis';
import { validateEnv } from './config/env.schema';
import type { Env } from './config/env.schema';
import { HealthModule } from './modules/health/health.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';
import { StorageModule } from './common/storage/storage.module';
import { DisposableEmailModule } from './modules/disposable-email/disposable-email.module';
import { AuthModule } from './modules/auth/auth.module';
import { TechnologiesModule } from './modules/technologies/technologies.module';
import { StacksModule } from './modules/stacks/stacks.module';
import { StackTemplatesModule } from './modules/stack-templates/stack-templates.module';
import { DataScopesModule } from './modules/data-scopes/data-scopes.module';
import { ReportsModule } from './modules/reports/reports.module';
import { PdfModule } from './modules/pdf/pdf.module';
import { InvitationsModule } from './modules/invitations/invitations.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { BillingModule } from './modules/billing/billing.module';
import { WaitlistModule } from './modules/waitlist/waitlist.module';
import { PublicModule } from './modules/public/public.module';
import { RateLimitGuard } from './common/guards/rate-limit.guard';

@Module({
 imports: [
  ConfigModule.forRoot({
   isGlobal: true,
   validate: validateEnv,
   envFilePath: '.env',
  }),
  LoggerModule.forRootAsync({
   useFactory: (configService: ConfigService<Env, true>) => {
    const isProduction =
     configService.get('NODE_ENV', { infer: true }) === 'production';
    return {
     pinoHttp: {
      level: isProduction ? 'info' : 'debug',
      transport: isProduction
       ? undefined // native JSON output in production
       : {
          target: 'pino-pretty',
          options: { colorize: true, singleLine: false },
         },
     },
    };
   },
   inject: [ConfigService],
  }),
  BullModule.forRootAsync({
   useFactory: (configService: ConfigService<Env, true>) => {
    const redisUrl =
     configService.get('REDIS_URL', { infer: true }) ??
     'redis://localhost:6379';
    const connection = new Redis(redisUrl, {
     maxRetriesPerRequest: null,
     enableReadyCheck: false,
     lazyConnect: true,
    });
    connection.on('error', () => {
     // Suppress unhandled rejection — BullMQ workers handle retry logic
    });
    return { connection };
   },
   inject: [ConfigService],
  }),
  PrismaModule,
  RedisModule,
  StorageModule,
  HealthModule,
  DisposableEmailModule,
  AuthModule,
  TechnologiesModule,
  StacksModule,
  StackTemplatesModule,
  DataScopesModule,
  ReportsModule,
  PdfModule,
  InvitationsModule,
  AuditLogModule,
  BillingModule,
  WaitlistModule,
  PublicModule,
 ],
 providers: [RateLimitGuard],
})
export class AppModule {}
