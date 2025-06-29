export const APP_NAME = 'Zodiak';
export const APP_DESCRIPTION = 'Votre guide astral personnel';

export const SMS_SETTINGS = {
  SENDER_NAME: 'Zodiak',
  VERIFICATION_MESSAGE: (code: string) => 
    `🌟 Votre code de vérification ${APP_NAME} est : ${code}\n\nNe le partagez avec personne.`,
  WELCOME_MESSAGE: (name: string) =>
    `✨ Bienvenue sur ${APP_NAME}, ${name} !\n\nVotre voyage céleste commence maintenant. Découvrez votre guidance quotidienne et laissez les astres vous guider. 🌟`,
  GUIDANCE_MESSAGE: (name: string, summary: string) =>
    `🌟 Bonjour ${name},\n\nVotre guidance du jour :\n${summary}\n\nConsultez votre guidance complète sur ${APP_NAME} ✨`,
  TRIAL_ENDING_MESSAGE: (name: string, daysLeft: number) =>
    `🌙 ${name}, votre période d'essai ${APP_NAME} se termine dans ${daysLeft} jours.\n\nNe perdez pas votre connexion aux astres ! Prolongez votre guidance maintenant ✨`
};

export const AUTH_SETTINGS = {
  CODE_LENGTH: 6,
  CODE_EXPIRY: 10 * 60 * 1000, // 10 minutes
  SESSION_DURATION: 7 * 24 * 60 * 60 * 1000, // 7 jours
  STORAGE_KEY: 'auth_session'
};

export const TRIAL_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 jours au lieu de 30

export const API_SETTINGS = {
  CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 heures
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000 // 1 seconde
};