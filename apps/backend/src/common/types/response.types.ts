import { Field, ObjectType } from '@nestjs/graphql';
import { Type } from '@nestjs/common';

export enum ErrorCode {
  // 通用錯誤
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  BAD_REQUEST = 'BAD_REQUEST',

  // 業務錯誤
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  INVALID_INPUT = 'INVALID_INPUT',
  RESOURCE_LOCKED = 'RESOURCE_LOCKED',
}

@ObjectType()
export class ErrorDetail {
  @Field(() => String)
  code: ErrorCode;

  @Field(() => String)
  message: string;

  @Field(() => String, { nullable: true })
  field?: string;

  @Field(() => String, { nullable: true })
  details?: string;
}

export function BaseResponse<T>(classRef: Type<T>) {
  @ObjectType({ isAbstract: true })
  abstract class BaseResponseClass {
    @Field(() => Boolean)
    success: boolean;

    @Field(() => String, { nullable: true })
    message?: string;

    @Field(() => classRef, { nullable: true })
    data?: T;

    @Field(() => [ErrorDetail], { nullable: true })
    errors?: ErrorDetail[];

    @Field(() => String, { nullable: true })
    requestId?: string;
  }

  return BaseResponseClass;
}

@ObjectType()
export class PaginationInfo {
  @Field(() => Number)
  page: number;

  @Field(() => Number)
  limit: number;

  @Field(() => Number)
  total: number;

  @Field(() => Number)
  totalPages: number;

  @Field(() => Boolean)
  hasNextPage: boolean;

  @Field(() => Boolean)
  hasPreviousPage: boolean;
}

export function PaginatedResponse<T>(classRef: Type<T>) {
  @ObjectType({ isAbstract: true })
  abstract class PaginatedResponseClass extends BaseResponse(classRef) {
    @Field(() => [classRef], { nullable: true })
    items?: T[];

    @Field(() => PaginationInfo, { nullable: true })
    pagination?: PaginationInfo;
  }

  return PaginatedResponseClass;
}
