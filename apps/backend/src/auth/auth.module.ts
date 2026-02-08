import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';
import { RbacModule } from '../rbac/rbac.module';
import { TwoFactorAuthModule } from '../two-factor-auth/two-factor-auth.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { NotificationModule } from '../notification/notification.module';
import { CronMonitoringModule } from '../cron-monitoring/cron-monitoring.module';
import { AuthService } from './auth.service';
import { AccountLockoutService } from './account-lockout.service';
import { PasswordResetService } from './password-reset.service';
import { SessionManagementService } from './session-management.service';
import { HQSessionService } from './hq-session.service';
import { AuthResolver } from './auth.resolver';
import { HQSessionResolver } from './hq-session.resolver';
import { JwtStrategy } from './jwt.strategy';
import { HQSessionGuard } from './hq-session.guard';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    MailModule,
    RbacModule,
    TwoFactorAuthModule,
    AuditLogModule,
    NotificationModule,
    CronMonitoringModule,
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
    AccountLockoutService,
    PasswordResetService,
    SessionManagementService,
    HQSessionService,
    AuthResolver,
    HQSessionResolver,
    JwtStrategy,
    HQSessionGuard,
  ],
  exports: [
    AuthService,
    AccountLockoutService,
    PasswordResetService,
    SessionManagementService,
    HQSessionService,
    JwtStrategy,
    HQSessionGuard,
  ],
})
export class AuthModule {}
