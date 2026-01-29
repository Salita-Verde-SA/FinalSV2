import React from 'react';
import { Facebook, Twitter, Instagram, MapPin, Bike, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-text-primary text-gray-300 pt-16 pb-8 border-t-4 border-primary">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <Bike size={28} />
              <span className="font-black text-2xl italic tracking-tighter">VELO<span className="text-primary">RACE</span></span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
              Especialistas en ciclismo de competición y recreativo. Representantes oficiales de las mejores marcas. Pasión por pedalear.
            </p>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider mb-4 text-sm">Tienda</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-primary transition-colors">Bicicletas MTB</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Bicicletas Ruta</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Indumentaria</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Outlet</a></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider mb-4 text-sm">Comunidad</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-primary transition-colors">Salidas Grupales</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Taller Shimano Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Club Strava</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Blog Técnico</a></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider mb-4 text-sm">Encuéntranos</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-primary mt-0.5" />
                <span>Av. Libertador 2300,<br/>Buenos Aires, Argentina</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-primary" />
                <span>ventas@velorace.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© 2026 VeloRace Bikes. Todos los derechos reservados.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white transition-colors"><Facebook size={18} /></a>
            <a href="#" className="hover:text-white transition-colors"><Twitter size={18} /></a>
            <a href="#" className="hover:text-white transition-colors"><Instagram size={18} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;