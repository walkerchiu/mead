import { InputType, Field } from '@nestjs/graphql';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsNotEmpty,
  IsBoolean,
  MaxLength,
} from 'class-validator';

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: '名稱必須是字串' })
  @MaxLength(100, { message: '名稱長度不可超過 100 字元' })
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail({}, { message: 'Email 格式不正確' })
  email?: string;
}

@InputType()
export class UpdateProfileInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: '個人簡介必須是字串' })
  @MaxLength(500, { message: '個人簡介長度不可超過 500 字元' })
  bio?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: '頭像必須是字串' })
  avatar?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: '電話必須是字串' })
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: '地址必須是字串' })
  address?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: '網站必須是字串' })
  website?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: '語言必須是字串' })
  language?: string;
}

@InputType()
export class ChangePasswordInput {
  @Field()
  @IsNotEmpty({ message: '當前密碼不可為空' })
  @IsString({ message: '當前密碼必須是字串' })
  currentPassword: string;

  @Field()
  @IsNotEmpty({ message: '新密碼不可為空' })
  @IsString({ message: '新密碼必須是字串' })
  newPassword: string;

  @Field({ defaultValue: false })
  @IsOptional()
  @IsBoolean({ message: '撤銷其他 sessions 必須是布林值' })
  revokeOtherSessions?: boolean;
}
