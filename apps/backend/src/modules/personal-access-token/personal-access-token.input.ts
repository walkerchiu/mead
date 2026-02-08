import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsString,
  MinLength,
  MaxLength,
  IsArray,
  ArrayMinSize,
  IsIn,
  IsInt,
} from 'class-validator';

@InputType({ description: '建立個人存取權杖輸入' })
export class CreatePersonalAccessTokenInput {
  @Field(() => String, { description: '權杖名稱（如「同步腳本」）' })
  @IsString()
  @MinLength(3, { message: '權杖名稱至少 3 個字元' })
  @MaxLength(100, { message: '權杖名稱最多 100 個字元' })
  name: string;

  // 模板未預設 scope；scope 的合法性由 service 層的 ALLOWED_SCOPES 白名單檢查
  @Field(() => [String], { description: '授權範圍' })
  @IsArray()
  @ArrayMinSize(1, { message: '至少選擇一個授權範圍' })
  @IsString({ each: true })
  scopes: string[];

  @Field(() => Int, { description: '到期天數（30, 90, 180）' })
  @IsInt()
  @IsIn([30, 90, 180], { message: '到期天數必須為 30, 90 或 180' })
  expiresInDays: number;
}
