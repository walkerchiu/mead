import { Module, Global } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { RbacModule } from '../../rbac/rbac.module';
import { MailModule } from '../../mail/mail.module';
import { AuthModule } from '../../auth/auth.module';

@Global()
@Module({
  imports: [RbacModule, MailModule, AuthModule],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UserModule {}
