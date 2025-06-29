export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public httpStatus?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class AuthError extends AppError {
  constructor(message: string, code = 'AUTH_ERROR') {
    super(message, code, 401);
    this.name = 'AuthError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, code = 'VALIDATION_ERROR') {
    super(message, code, 400);
    this.name = 'ValidationError';
  }
}

export class ApiError extends AppError {
  constructor(message: string, code = 'API_ERROR') {
    super(message, code, 500);
    this.name = 'ApiError';
  }
}

export const ErrorMessages = {
  INVALID_PHONE: 'Format de numéro invalide. Utilisez le format 06XXXXXXXX',
  SESSION_EXPIRED: 'Session expirée',
  WRONG_PHONE: 'Numéro de téléphone incorrect',
  WRONG_CODE: 'Code incorrect',
  CODE_EXPIRED: 'Code expiré',
  UNAUTHORIZED: 'Non autorisé',
  PROFILE_NOT_FOUND: 'Profil non trouvé',
  API_ERROR: 'Une erreur est survenue',
  SMS_ERROR: 'Erreur lors de l\'envoi du SMS',
  INVALID_BIRTH_DATA: 'Données de naissance invalides'
};