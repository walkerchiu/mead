import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PermissionService } from './permission.service';
import { RoleService } from './role.service';

@Module({
  imports: [PrismaModule],
  providers: [PermissionService, RoleService],
  exports: [PermissionService, RoleService],
})
export class RbacModule {}
