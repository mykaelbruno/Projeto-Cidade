import { Handshake, MapPin, Mail, Phone, Facebook, Twitter, Instagram } from 'lucide-react';
import { Link } from 'react-router';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-[#087F5B] to-[#0F4C81] rounded-lg flex items-center justify-center">
                <Handshake className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-display font-bold text-foreground">
                Conecta Cidadão
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Plataforma colaborativa que conecta moradores à prefeitura para resolver problemas urbanos de forma transparente e eficiente.
            </p>
            <p className="text-xs font-medium text-primary">
              Você informa. A prefeitura resolve.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-display font-semibold text-foreground mb-4">
              Links Úteis
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/feed" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Feed de Relatos
                </Link>
              </li>
              <li>
                <Link to="/mapa" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Mapa da Cidade
                </Link>
              </li>
              <li>
                <Link to="/novo-relato" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Fazer Relato
                </Link>
              </li>
              <li>
                <Link to="/minhas" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Minhas Solicitações
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="font-display font-semibold text-foreground mb-4">
              Sobre
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Como Funciona
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Perguntas Frequentes
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Termos de Uso
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Política de Privacidade
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-semibold text-foreground mb-4">
              Contato
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Prefeitura de Mamanguape<br />Mamanguape - PB</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <a href="tel:+558333331234" className="hover:text-primary transition-colors">
                  (83) 3333-1234
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <a href="mailto:contato@mamanguape.pb.gov.br" className="hover:text-primary transition-colors">
                  contato@mamanguape.pb.gov.br
                </a>
              </li>
            </ul>

            {/* Social Media */}
            <div className="flex items-center gap-3 mt-4">
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {currentYear} Conecta Cidadão. Todos os direitos reservados.
          </p>
          <p className="text-xs text-muted-foreground text-center md:text-right">
            Desenvolvido com 💚 para melhorar nossa cidade
          </p>
        </div>
      </div>
    </footer>
  );
}
