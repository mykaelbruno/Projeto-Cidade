import { useCallback, useEffect, useState } from 'react';
import { notificacaoService } from '../services/notificacaoService';

const notificationsUpdatedEvent = 'cidade-ativa:notificacoes-atualizadas';

export function notifyNotificationsUpdated() {
  window.dispatchEvent(new CustomEvent(notificationsUpdatedEvent));
}

export function useUnreadNotificationsCount() {
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const response = await notificacaoService.listarMinhas({
        somenteNaoLidas: true,
        page: 0,
        size: 1,
      });
      setUnreadCount(response.totalElements ?? response.content.length);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    refreshUnreadCount();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshUnreadCount();
      }
    };

    window.addEventListener(notificationsUpdatedEvent, refreshUnreadCount);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener(notificationsUpdatedEvent, refreshUnreadCount);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshUnreadCount]);

  return {
    unreadCount,
    refreshUnreadCount,
  };
}
