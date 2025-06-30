import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SuperAuthService } from '../auth';
import { StorageService } from '../storage';

export function useGuidanceRedirect(userId: string | null) {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAccessAndRedirect = async () => {
      if (!userId) {
        navigate('/', { replace: true });
        return;
      }

      const currentUser = await SuperAuthService.getCurrentUser();
      if (!currentUser || currentUser.id !== userId) {
        SuperAuthService.signOut().then(() => {
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