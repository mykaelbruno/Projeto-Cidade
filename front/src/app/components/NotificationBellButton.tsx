import { Bell } from 'lucide-react';

interface NotificationBellButtonProps {
  unreadCount: number;
  onClick: () => void;
}

export function NotificationBellButton({ unreadCount, onClick }: NotificationBellButtonProps) {
  return (
    <button
      onClick={onClick}
      className="relative p-2 hover:bg-muted rounded-lg transition-colors"
      title="Notificacoes"
    >
      <Bell className="w-5 h-5 text-foreground" />
      {unreadCount > 0 && (
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
      )}
    </button>
  );
}
