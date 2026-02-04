import React from 'react';
import { Facebook, Twitter, Instagram, MapPin, Bike, Mail, ArrowUpRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#0a0a0b] text-gray-400 pt-20 pb-10 border-t-2 border-brand-accent relative overflow-hidden">
      {/* Detalle de fondo */}
      <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
         <Bike size={300} strokeWidth={0.5} />
      </div>

      <div className="max-w-[1600px] mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-white">
              <span className="font-black text-3xl italic tracking-tighter">VELO<span className="text-brand-accent">RACE</span></span>
            </div>
            <p className="text-xs font-mono uppercase tracking-wide leading-relaxed max-w-xs text-gray-500">
              Mendoza Racing Division.<br/>
              Equipamiento técnico para ciclistas que exigen rendimiento.
            </p>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="text-white font-black uppercase tracking-widest mb-6 text-xs border-l-2 border-brand-accent pl-2">Categorías</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><a href="#" className="hover:text-brand-accent transition-colors flex items-center gap-2 group"><ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity"/> MTB Series</a></li>
              <li><a href="#" className="hover:text-brand-accent transition-colors flex items-center gap-2 group"><ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity"/> Ruta Pro</a></li>
              <li><a href="#" className="hover:text-brand-accent transition-colors flex items-center gap-2 group"><ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity"/> Componentes</a></li>
              <li><a href="#" className="hover:text-brand-accent transition-colors flex items-center gap-2 group"><ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity"/> Indumentaria</a></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="text-white font-black uppercase tracking-widest mb-6 text-xs border-l-2 border-brand-accent pl-2">Soporte</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><a href="#" className="hover:text-brand-accent transition-colors">Estado del Pedido</a></li>
              <li><a href="#" className="hover:text-brand-accent transition-colors">Servicio Técnico</a></li>
              <li><a href="#" className="hover:text-brand-accent transition-colors">Garantías</a></li>
              <li><a href="#" className="hover:text-brand-accent transition-colors">Contacto Directo</a></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-white font-black uppercase tracking-widest mb-6 text-xs border-l-2 border-brand-accent pl-2">Base</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-brand-accent shrink-0" />
                <span className="uppercase text-xs font-mono leading-relaxed">Av. Libertador 2300<br/>Mendoza, Argentina</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-brand-accent shrink-0" />
                <span className="font-mono text-xs">team@velorace.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
          <p>© 2026 VELORACE TECH LABS.</p>
          <div className="flex space-x-8">
            <a href="#" className="hover:text-white transition-colors flex items-center gap-2"><Facebook size={16} /> FB</a>
            <a href="#" className="hover:text-white transition-colors flex items-center gap-2"><Twitter size={16} /> X</a>
            <a href="#" className="hover:text-white transition-colors flex items-center gap-2"><Instagram size={16} /> IG</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;