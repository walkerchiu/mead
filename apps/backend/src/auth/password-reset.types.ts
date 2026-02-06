import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class PasswordResetResponse {
  @Field(() => Boolean, {
    description: '是否成功發送重置郵件',
  })
  success: boolean;

  @Field(() => String, {
    description: '提示訊息',
  })
  message: string;
}

@ObjectType()
export class VerifyTokenResponse {
  @Field(() => Boolean, {
    description: 'Token 是否有效',
  })
  valid: boolean;
}
