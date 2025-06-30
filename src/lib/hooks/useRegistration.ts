import { useState, useEffect } from 'react';
import { StorageService } from '../storage';
import { SuperAuthService } from '../auth';
import type { Profile } from '../types/supabase';

interface RegistrationData {
  name: string;
  dob: string;
  birthTime: string;
  birthPlace: string;
  currentStep: number;
}

export function useRegistration() {
  const [formData, setFormData] = useState<RegistrationData>({
    name: '',
    dob: '',
    birthTime: '',
    birthPlace: '',
    currentStep: 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Charger les données sauvegardées au montage
  useEffect(() => {
    const savedData = StorageService.getFormData();
    if (savedData) {
      setFormData(savedData);
    }
  }, []);

  // Sauvegarder les données à chaque modification
  const updateFormData = (data: Partial<RegistrationData>) => {
    const newData = { ...formData, ...data };
    setFormData(newData);
    StorageService.saveFormData(newData);
  };

  // Vérifier si l'utilisateur est déjà inscrit
  const checkExistingProfile = (userId: string): Profile | null => {
    return StorageService.getProfile(userId);
  };

  // Nettoyer les données d'inscription
  const clearRegistration = () => {
    StorageService.clearFormData();
    setFormData({
      name: '',
      dob: '',
      birthTime: '',
      birthPlace: '',
      currentStep: 1
    });
  };

  // Gérer la connexion réussie
  const handleAuthSuccess = (userId: string) => {
    const existingProfile = checkExistingProfile(userId);
    
    if (existingProfile) {
      // Si l'utilisateur existe déjà, charger son profil
      return {
        isNewUser: false,
        profile: existingProfile
      };
    } else {
      // Si c'est un nouvel utilisateur, charger les données du formulaire
      const savedData = StorageService.getFormData();
      if (savedData) {
        setFormData(savedData);
      }
      return {
        isNewUser: true,
        profile: null
      };
    }
  };

  // Valider les données du formulaire
  const validateForm = (step: number): boolean => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 2:
        if (!formData.name) {
          errors.name = 'Le nom est requis';
        }
        break;
      case 3:
        if (!formData.dob) {
          errors.dob = 'La date de naissance est requise';
        }
        if (!formData.birthTime) {
          errors.birthTime = 'L\'heure de naissance est requise';
        }
        if (!formData.birthPlace) {
          errors.birthPlace = 'Le lieu de naissance est requis';
        }
        break;
    }

    setError(Object.values(errors)[0] || null);
    return Object.keys(errors).length === 0;
  };

  return {
    formData,
    loading,
    error,
    success,
    updateFormData,
    validateForm,
    handleAuthSuccess,
    clearRegistration,
    setLoading,
    setError,
    setSuccess
  };
}