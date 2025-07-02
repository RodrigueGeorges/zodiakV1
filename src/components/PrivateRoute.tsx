import { useAuth } from '../lib/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isLoading, profile } = useAuth();
  const location = useLocation();

  if (isLoading) return null; // ou un loader
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location, message: 'Votre session a expiré, veuillez vous reconnecter.' }} replace />;
  }
  if (!profile) {
    return <Navigate to="/register/complete" state={{ from: location, message: 'Merci de compléter votre profil.' }} replace />;
  }
  return children;
}

export default PrivateRoute; 