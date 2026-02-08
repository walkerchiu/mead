import { Global, Module } from '@nestjs/common';
import { PersonalAccessTokenService } from './personal-access-token.service';
import { PersonalAccessTokenResolver } from './personal-access-token.resolver';
import { PrismaModule } from '../../prisma/prisma.module';
import { RbacModule } from '../../rbac/rbac.module';
import { PatAuthGuard } from '../../auth/pat-auth.guard';
import { NotificationModule } from '../../notification/notification.module';
import { MailModule } from '../../mail/mail.module';

@Global()
@Module({
  imports: [PrismaModule, RbacModule, NotificationModule, MailModule],
  providers: [
    PersonalAccessTokenService,
    PersonalAccessTokenResolver,
    PatAuthGuard,
  ],
  exports: [PersonalAccessTokenService, PatAuthGuard],
})
export class PersonalAccessTokenModule {}
