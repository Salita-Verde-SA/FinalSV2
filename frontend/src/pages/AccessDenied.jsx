import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ShieldBan } from 'lucide-react';

const AccessDenied = () => {
  return (
    <div className="min-h-screen bg-[#0f1115] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Patrón de seguridad */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#ef444405_10px,#ef444405_20px)] pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center relative z-10 max-w-lg bg-[#16191e] p-12 border border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.1)]"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
        
        <div className="mb-8 inline-flex p-6 bg-red-500/10 rounded-full border border-red-500/20">
           <ShieldBan size={48} className="text-red-500" />
        </div>

        <h1 className="text-6xl font-black text-white italic tracking-tighter leading-none mb-4">
          403
        </h1>
        
        <div className="inline-block px-4 py-1 border border-red-500 text-red-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
           Acceso Denegado
        </div>

        <p className="text-gray-400 mb-10 font-mono text-sm leading-relaxed">
          Área restringida para Comisarios Deportivos y Team Managers. <br/>
          Tus credenciales no tienen autorización para este sector.
        </p>

        <Link 
          to="/"
          className="inline-flex items-center gap-2 bg-white text-black hover:bg-red-500 hover:text-white font-black uppercase tracking-widest px-8 py-4 transition-all"
        >
          <Home size={18} />
          Volver a Pits
        </Link>
      </motion.div>
    </div>
  );
};

export default AccessDenied;