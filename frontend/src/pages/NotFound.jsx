import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#0f1115] flex items-center justify-center px-4 relative overflow-hidden text-white">
      <div className="text-[20vw] font-black text-white/5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 select-none italic tracking-tighter pointer-events-none">
        404
      </div>
      <div className="text-center relative z-10 max-w-lg">
        <Compass size={64} className="text-brand-accent mx-auto mb-8 animate-pulse" />
        <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-6 text-white">
          Fuera de <span className="text-brand-accent">Ruta</span>
        </h2>
        <p className="text-gray-500 mb-10 text-sm font-mono uppercase tracking-widest">
          Señal GPS perdida. El tramo que buscas no existe.
        </p>
        <Link to="/" className="inline-flex items-center gap-2 bg-brand-accent text-black font-black uppercase tracking-widest px-8 py-4 hover:bg-white transition-colors">
          <Home size={18} /> Volver al Inicio
        </Link>
      </div>
    </div>
  );
};

export default NotFound;