import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsFutureDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsFutureDate',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;
          const date = new Date(value);
          if (isNaN(date.getTime())) return false;
          const now = new Date();
          return date.getTime() > now.getTime();
        },
        defaultMessage(args?: ValidationArguments) {
          return `${args?.property} must be a future date-time`;
        },
      },
    });
  };
}
