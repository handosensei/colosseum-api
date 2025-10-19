import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { ParticipationCreateDto } from '../dto/participation-create.dto';

export function ExactlyOneWinner(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'ExactlyOneWinner',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: ParticipationCreateDto[]) {
          if (!Array.isArray(value)) return false;
          return value.filter((p) => p?.isWinner === true).length === 1;
        },
        defaultMessage(args?: ValidationArguments) {
          return 'participations must contain exactly one winner';
        },
      },
    });
  };
}
