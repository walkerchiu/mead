import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtPayload } from '../auth/auth.types';
import { AccessScope } from '../common/enums/access-scope.enum';
import { FeatureMatrixService } from './feature-matrix.service';
import {
  RoleFeatureRowType,
  SetRoleFeatureAccessInput,
} from './feature-matrix.types';

/**
 * 功能權限矩陣 GraphQL 介面（用戶管理「功能權限」分頁）。
 * 授權（scope / rank / roles:manage）在 service 層依 JWT claim 判斷。
 */
@Resolver()
@UseGuards(JwtAuthGuard)
export class FeatureMatrixResolver {
  constructor(private readonly featureMatrixService: FeatureMatrixService) {}

  @Query(() => [RoleFeatureRowType], {
    description: '指定 scope 的功能權限矩陣（角色 × 功能 read/write）',
  })
  async featureMatrix(
    @Args('scope', { type: () => AccessScope }) scope: AccessScope,
    @CurrentUser() user: JwtPayload,
  ): Promise<RoleFeatureRowType[]> {
    return this.featureMatrixService.getFeatureMatrix(scope, user);
  }

  @Mutation(() => Boolean, {
    description:
      '設定角色對單一功能的檢視／管理存取（OWNER 鎖定、需 roles:manage 且 rank 嚴格高於該角色）',
  })
  async setRoleFeatureAccess(
    @Args('input') input: SetRoleFeatureAccessInput,
    @CurrentUser() user: JwtPayload,
  ): Promise<boolean> {
    return this.featureMatrixService.setRoleFeatureAccess(input, user);
  }
}
