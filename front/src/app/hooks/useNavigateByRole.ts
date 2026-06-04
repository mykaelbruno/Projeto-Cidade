import { useNavigate } from 'react-router';
import { getHomePathByUserType, useUser } from '../contexts/UserContext';

export function useNavigateByRole() {
  const navigate = useNavigate();
  const { userType } = useUser();

  const getHomePath = () => getHomePathByUserType(userType);

  const navigateToHome = () => {
    navigate(getHomePath());
  };

  return {
    navigateToHome,
    getHomePath,
  };
}
