import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Character } from '../../character/character.entity';

@ValidatorConstraint({ name: 'CharacterExists', async: true })
@Injectable()
export class CharacterExistsConstraint implements ValidatorConstraintInterface {
  constructor(
    @InjectRepository(Character)
    private readonly characterRepo: Repository<Character>,
  ) {}

  async validate(value: string): Promise<boolean> {
    if (!value) return false;
    const count = await this.characterRepo.count({ where: { id: value } });
    return count > 0;
  }

  defaultMessage(args?: ValidationArguments): string {
    return `Character with id ${args?.value} does not exist`;
  }
}

export function CharacterExists(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: CharacterExistsConstraint,
    });
  };
}
