import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { MyReports } from '../components/MyReports';
import { getApiErrorMessage } from '../services/apiClient';
import { denunciaService } from '../services/denunciaService';
import { mapMinhaDenunciaToReport } from '../mappers/denunciaMapper';
import type { DenunciaResponseDTO } from '../types/denuncia';

export function MyReportsPage() {
  const navigate = useNavigate();
  const [denuncias, setDenuncias] = useState<DenunciaResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregarMinhasDenuncias = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await denunciaService.listarMinhas(0, 50);
      setDenuncias(response.content);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarMinhasDenuncias();
  }, [carregarMinhasDenuncias]);

  const reports = useMemo(
    () => denuncias.map(mapMinhaDenunciaToReport),
    [denuncias],
  );

  return (
    <MyReports
      reports={reports}
      isLoading={isLoading}
      error={error}
      onRetry={carregarMinhasDenuncias}
      onReportClick={(report) => navigate(`/relato/${report.id}`)}
    />
  );
}
