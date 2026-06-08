import { useNavigate } from 'react-router';
import { NewReportFlow } from '../components/NewReportFlow';

export function NewReportPage() {
  const navigate = useNavigate();

  return (
    <NewReportFlow
      onClose={() => navigate(-1)}
      onViewReport={(denunciaId) => navigate(`/relato/${denunciaId}`)}
      onCreated={(denunciaId) => navigate('/feed', { state: { createdReportId: denunciaId } })}
    />
  );
}
