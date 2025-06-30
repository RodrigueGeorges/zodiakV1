import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SuperAuthService } from '../auth';
import { StorageService } from '../storage';

export function useAuthRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const currentUser = SuperAuthService.getCurrentUser();
      
      if (currentUser) {
        const profile = StorageService.getProfile(currentUser.id);
        
        if (profile) {
          // Si l'utilisateur a un profil, rediriger vers sa guidance
          navigate(`/guidance/${currentUser.id}`, { replace: true });
        } else {
          // Si l'utilisateur n'a pas de profil, restaurer le formulaire d'inscription
          const savedData = StorageService.getFormData();
          if (savedData) {
            // Reprendre l'inscription là où elle s'était arrêtée
            navigate('/', { replace: true });
          } else {
            // Commencer une nouvelle inscription
            navigate('/', { replace: true });
          }
        }
      }
    };

    checkAuthAndRedirect();
  }, [navigate]);
}