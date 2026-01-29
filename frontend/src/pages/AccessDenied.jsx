import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ShieldBan, XOctagon } from 'lucide-react';

const AccessDenied = () => {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 relative overflow-hidden">
      {/* Fondo técnico */}
      <div className="absolute inset-0 bg-topo-pattern opacity-5 pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-center relative z-10 max-w-lg bg-white p-12 border-2 border-red-500 shadow-2xl"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mb-6 inline-flex"
        >
          <div className="p-4 bg-red-500 text-white transform -skew-x-12">
            <ShieldBan size={64} className="transform skew-x-12" />
          </div>
        </motion.div>

        <h1 className="text-8xl font-black text-text-primary italic tracking-tighter leading-none mb-2">
          403
        </h1>
        
        <div className="bg-red-100 text-red-600 font-bold uppercase tracking-widest text-sm py-1 mb-6 inline-block px-4 transform -skew-x-12">
           <span className="transform skew-x-12 block">Acceso Restringido</span>
        </div>

        <p className="text-text-secondary mb-8 font-medium">
          Zona exclusiva para Comisarios Deportivos y Team Managers. <br/>
          Tu licencia no tiene los permisos necesarios.
        </p>

        <Link 
          to="/"
          className="inline-flex items-center gap-2 bg-text-primary hover:bg-black text-white font-black uppercase tracking-wider px-8 py-4 transition-all transform hover:-translate-y-1 hover:shadow-lg"
        >
          <Home size={18} />
          Volver a Pits
        </Link>
        
        <div className="mt-8 pt-6 border-t border-dashed border-ui-border">
          <code className="text-[10px] font-mono text-text-muted bg-surface px-2 py-1">
            ERROR::PERMISSION_DENIED::RIDER_UNAUTHORIZED
          </code>
        </div>
      </motion.div>
    </div>
  );
};

export default AccessDenied;