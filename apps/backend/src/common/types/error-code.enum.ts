import { registerEnumType } from '@nestjs/graphql';

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

registerEnumType(ErrorCode, {
  name: 'ErrorCode',
  description: '錯誤代碼',
});
