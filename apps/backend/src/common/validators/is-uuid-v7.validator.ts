import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

const UUID_V7_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@ValidatorConstraint({ async: false })
export class IsUuidV7Constraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    return UUID_V7_REGEX.test(value);
  }

  defaultMessage(): string {
    return '$property 必須是有效的 UUID';
  }
}

/**
 * 自訂 UUID 驗證裝飾器，支援 UUID v1-v7（含 v7）。
 * class-validator 的 @IsUUID('all') 不支援 UUID v7，因此需要此自訂驗證。
 */
export function IsUuidV7(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUuidV7Constraint,
    });
  };
}
