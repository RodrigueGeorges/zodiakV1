import { z } from 'zod';
import { ValidationSchemas } from './schemas';

export class Validator {
  static validate<T>(schema: z.ZodType<T>, data: unknown): {
    success: boolean;
    data?: T;
    error?: string;
  } {
    try {
      const validated = schema.parse(data);
      return { success: true, data: validated };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: error.errors[0].message
        };
      }
      return {
        success: false,
        error: 'Erreur de validation'
      };
    }
  }

  static validatePhone(phone: string) {
    return this.validate(ValidationSchemas.phone, phone);
  }

  static validateVerificationCode(code: string) {
    return this.validate(ValidationSchemas.verificationCode, code);
  }

  static validateName(name: string) {
    return this.validate(ValidationSchemas.name, name);
  }

  static validateBirthDate(date: string) {
    return this.validate(ValidationSchemas.birthDate, date);
  }

  static validateBirthTime(time: string) {
    return this.validate(ValidationSchemas.birthTime, time);
  }

  static validateCoordinates(coordinates: string) {
    return this.validate(ValidationSchemas.coordinates, coordinates);
  }
}