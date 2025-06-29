import { z } from 'zod';

// Schémas de validation stricts
export const ValidationSchemas = {
  phone: z.string()
    .regex(/^(\+33|0)[67]\d{8}$/, 'Format de numéro invalide')
    .transform(val => val.startsWith('0') ? `+33${val.slice(1)}` : val),

  verificationCode: z.string()
    .length(6, 'Le code doit faire 6 chiffres')
    .regex(/^\d+$/, 'Le code doit contenir uniquement des chiffres'),

  name: z.string()
    .min(2, 'Le nom doit faire au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le nom contient des caractères invalides'),

  birthDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide')
    .refine(val => {
      const date = new Date(val);
      return date <= new Date() && date >= new Date('1900-01-01');
    }, 'Date de naissance invalide'),

  birthTime: z.string()
    .regex(/^\d{2}:\d{2}$/, 'Format d\'heure invalide')
    .refine(val => {
      const [hours, minutes] = val.split(':').map(Number);
      return hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60;
    }, 'Heure invalide'),

  coordinates: z.string()
    .regex(/^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/, 'Format de coordonnées invalide')
    .refine(val => {
      const [lat, lon] = val.split(',').map(Number);
      return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
    }, 'Coordonnées invalides')
} as const;