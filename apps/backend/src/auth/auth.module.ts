import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';
import { RbacModule } from '../rbac/rbac.module';
import { TwoFactorAuthModule } from '../two-factor-auth/two-factor-auth.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { AuthService } from './auth.service';
import { PasswordResetService } from './password-reset.service';
import { SessionManagementService } from './session-management.service';
import { AdminSessionService } from './admin-session.service';
import { AuthResolver } from './auth.resolver';
import { AdminSessionResolver } from './admin-session.resolver';
import { JwtStrategy } from './jwt.strategy';
import { AdminSessionGuard } from './admin-session.guard';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    MailModule,
    RbacModule,
    TwoFactorAuthModule,
    AuditLogModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error(
            'JWT_SECRET is not defined. Please set JWT_SECRET environment variable.',
          );
        }
        return {
          secret,
          signOptions: {
            expiresIn: '15m', // Access token 預設過期時間
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    PasswordResetService,
    SessionManagementService,
    AdminSessionService,
    AuthResolver,
    AdminSessionResolver,
    JwtStrategy,
    AdminSessionGuard,
  ],
  exports: [
    AuthService,
    PasswordResetService,
    SessionManagementService,
    AdminSessionService,
    JwtStrategy,
    AdminSessionGuard,
  ],
})
export class AuthModule {}
