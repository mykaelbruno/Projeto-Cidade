import { useNavigate } from 'react-router';
import { Welcome } from '../components/Welcome';

export function WelcomePage() {
  const navigate = useNavigate();

  return <Welcome onGetStarted={() => navigate('/feed')} />;
}
