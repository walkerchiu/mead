import { Module } from '@nestjs/common';
import { TwoFactorAuthService } from './two-factor-auth.service';
import { TwoFactorAuthResolver } from './two-factor-auth.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [PrismaModule, MailModule, AuditLogModule],
  providers: [TwoFactorAuthService, TwoFactorAuthResolver],
  exports: [TwoFactorAuthService],
})
export class TwoFactorAuthModule {}
