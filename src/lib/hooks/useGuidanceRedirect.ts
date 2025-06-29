import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../auth';
import { StorageService } from '../storage';

export function useGuidanceRedirect(userId: string | null) {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAccessAndRedirect = async () => {
      if (!userId) {
        navigate('/', { replace: true });
        return;
      }

      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser || currentUser.id !== userId) {
        AuthService.signOut().then(() => {
          navigate('/', { replace: true });
        });
        return;
      }

      const profile = StorageService.getProfile(userId);
      if (!profile) {
        navigate('/', { replace: true });
      }
    };

    checkAccessAndRedirect();
  }, [userId, navigate]);
}