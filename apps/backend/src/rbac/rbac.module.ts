import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PermissionService } from './permission.service';
import { RoleService } from './role.service';
import { FeatureMatrixService } from './feature-matrix.service';
import { FeatureMatrixResolver } from './feature-matrix.resolver';

@Module({
  imports: [PrismaModule],
  providers: [
    PermissionService,
    RoleService,
    FeatureMatrixService,
    FeatureMatrixResolver,
  ],
  exports: [PermissionService, RoleService, FeatureMatrixService],
})
export class RbacModule {}
