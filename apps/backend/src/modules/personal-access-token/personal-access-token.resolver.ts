import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PersonalAccessTokenService } from './personal-access-token.service';
import {
  PersonalAccessTokenType,
  CreatePersonalAccessTokenResult,
} from './personal-access-token.types';
import { CreatePersonalAccessTokenInput } from './personal-access-token.input';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequiresScope } from '../../common/decorators/requires-scope.decorator';
import { AccessScope } from '../../common/enums/access-scope.enum';
import { CurrentUser } from '../../auth/current-user.decorator';

interface UserPayload {
  userId: string;
  permissions: string[];
  isSuperHQ: boolean;
}

@Resolver(() => PersonalAccessTokenType)
@UseGuards(PermissionGuard)
@RequiresScope(AccessScope.CUSTOMER_SCOPE)
export class PersonalAccessTokenResolver {
  constructor(private readonly patService: PersonalAccessTokenService) {}

  @Query(() => [PersonalAccessTokenType], {
    description: '查詢個人存取權杖列表',
  })
  async myPersonalAccessTokens(
    @CurrentUser() user: UserPayload,
  ): Promise<PersonalAccessTokenType[]> {
    return this.patService.findAllByUser(user.userId);
  }

  @Mutation(() => CreatePersonalAccessTokenResult, {
    description: '建立個人存取權杖',
  })
  async createPersonalAccessToken(
    @CurrentUser() user: UserPayload,
    @Args('input') input: CreatePersonalAccessTokenInput,
  ): Promise<CreatePersonalAccessTokenResult> {
    return this.patService.create(
      user.userId,
      input.name,
      input.scopes,
      input.expiresInDays,
    );
  }

  @Mutation(() => Boolean, { description: '撤銷個人存取權杖' })
  async revokePersonalAccessToken(
    @CurrentUser() user: UserPayload,
    @Args('tokenId', { type: () => ID }) tokenId: string,
  ): Promise<boolean> {
    return this.patService.revoke(user.userId, tokenId);
  }
}
