import { z } from 'zod';

// Schémas de validation stricts
export const authValidation = {
  phone: z.string()
    .min(10, 'Le numéro doit faire 10 chiffres')
    .max(10, 'Le numéro doit faire 10 chiffres')
    .regex(/^(06|07)\d{8}$/, 'Le numéro doit commencer par 06 ou 07')
    .transform(val => val.replace(/\D/g, '')),

  code: z.string()
    .length(6, 'Le code doit faire exactement 6 chiffres')
    .regex(/^\d+$/, 'Le code doit contenir uniquement des chiffres'),

  session: z.object({
    user: z.object({
      id: z.string().uuid('ID utilisateur invalide'),
      phone: z.string().min(1, 'Numéro de téléphone requis')
    })
  }).strict(),
};

// Fonctions de validation avec retour typé
export const validatePhone = (phone: string): { 
  success: boolean;
  error?: string;
  value?: string;
} => {
  try {
    const cleaned = phone.replace(/\D/g, '');
    const result = authValidation.phone.parse(cleaned);
    return { success: true, value: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Format de numéro invalide' };
  }
};

export const validateCode = (code: string): {
  success: boolean;
  error?: string;
  value?: string;
} => {
  try {
    const result = authValidation.code.parse(code);
    return { success: true, value: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Format de code invalide' };
  }
};

export const validateSession = (session: unknown): {
  success: boolean;
  error?: string;
  value?: z.infer<typeof authValidation.session>;
} => {
  try {
    const result = authValidation.session.parse(session);
    return { success: true, value: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Session invalide' };
  }
};