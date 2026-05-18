import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import type { Env } from '../../config/env.schema';
import { DisposableEmailModule } from '../disposable-email/disposable-email.module';
import { EmailModule } from '../email/email.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService<Env, true>) => ({
        privateKey:
          configService
            .get('JWT_PRIVATE_KEY', { infer: true })
            ?.replace(/\\n/g, '\n') ?? '',
        publicKey:
          configService
            .get('JWT_PUBLIC_KEY', { infer: true })
            ?.replace(/\\n/g, '\n') ?? '',
        signOptions: {
          algorithm: 'RS256',
          expiresIn: configService.get('JWT_ACCESS_EXPIRES_IN', { infer: true }),
        },
        verifyOptions: {
          algorithms: ['RS256'],
        },
      }),
      inject: [ConfigService],
    }),
    DisposableEmailModule,
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenService, JwtStrategy],
  exports: [TokenService, JwtStrategy, PassportModule],
})
export class AuthModule {}
