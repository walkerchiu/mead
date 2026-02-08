import { Module, Global } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { UserDataLoaderService } from './user.dataloader';
import { RbacModule } from '../../rbac/rbac.module';
import { MailModule } from '../../mail/mail.module';
import { NotificationModule } from '../../notification/notification.module';
import { AuthModule } from '../../auth/auth.module';

@Global()
@Module({
  imports: [RbacModule, MailModule, NotificationModule, AuthModule],
  providers: [UserService, UserResolver, UserDataLoaderService],
  exports: [UserService, UserDataLoaderService],
})
export class UserModule {}
