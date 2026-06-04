import { Handshake, MapPin, Users, CheckCircle2 } from 'lucide-react';

interface WelcomeProps {
  onGetStarted: () => void;
}

export function Welcome({ onGetStarted }: WelcomeProps) {
  const features = [
    {
      icon: MapPin,
      title: 'Informe problemas',
      description: 'Relate problemas urbanos com fotos e localização',
    },
    {
      icon: Users,
      title: 'Apoie a comunidade',
      description: 'Apoie relatos de outros cidadãos e marque urgências',
    },
    {
      icon: CheckCircle2,
      title: 'Acompanhe soluções',
      description: 'Veja o status e confirme quando o problema for resolvido',
    },
  ];

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-[#087F5B] to-[#0F4C81] text-white overflow-hidden">
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-75" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        {/* Logo */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-white/10 rounded-3xl blur-2xl" />
          <div className="relative w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl">
            <Handshake className="w-14 h-14 text-[#087F5B]" strokeWidth={2.5} />
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-display font-bold text-center mb-3">
          Conecta Cidadão
        </h1>

        <p className="text-xl md:text-2xl font-display font-medium text-white/90 text-center mb-2">
          Você informa. A prefeitura resolve.
        </p>

        <p className="text-base text-white/70 text-center max-w-md mb-12">
          Plataforma colaborativa para melhorar a cidade através da participação cidadã
        </p>

        {/* Features */}
        <div className="w-full max-w-md space-y-4 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-[#087F5B]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-white mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-white/70">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Button */}
        <button
          onClick={onGetStarted}
          className="w-full max-w-md px-8 py-4 bg-white text-[#087F5B] rounded-2xl font-display font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all"
        >
          Começar agora
        </button>

        <p className="text-xs text-white/50 mt-6 text-center">
          Mamanguape - PB
        </p>
      </div>

      {/* Bottom decoration */}
      <div className="py-6 text-center text-white/50 text-xs relative z-10">
        Plataforma de zeladoria urbana e participação cidadã
      </div>
    </div>
  );
}
