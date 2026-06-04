import { Handshake } from 'lucide-react';
import { useNavigateByRole } from '../hooks/useNavigateByRole';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  clickable?: boolean;
}

export function Logo({ size = 'md', showText = true, clickable = true }: LogoProps) {
  const { navigateToHome } = useNavigateByRole();
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const handleClick = () => {
    if (clickable) {
      navigateToHome();
    }
  };

  return (
    <div
      className={`flex items-center gap-2 ${clickable ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#087F5B] to-[#0F4C81] rounded-xl opacity-10 blur-sm" />
        <div className={`relative ${sizeClasses[size]} bg-gradient-to-br from-[#087F5B] to-[#0F4C81] rounded-xl flex items-center justify-center`}>
          <Handshake className="w-[60%] h-[60%] text-white" strokeWidth={2.5} />
        </div>
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`${textSizeClasses[size]} font-display font-bold text-foreground`}>
            Conecta Cidadão
          </span>
        </div>
      )}
    </div>
  );
}
