import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Compass, Map } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-text-primary flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decoración de fondo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-primary transform -skew-x-12 translate-x-32"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center relative z-10 max-w-lg"
      >
        <div className="text-[180px] font-black text-white/5 leading-none absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 select-none italic">
          404
        </div>

        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="relative z-10"
        >
          <Compass size={80} className="text-primary mx-auto mb-6 animate-pulse" />
          
          <h2 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tight mb-4">
            Fuera de Ruta
          </h2>
          
          <p className="text-gray-400 mb-10 text-lg max-w-md mx-auto">
            Te has desviado del sendero marcado. El tramo que buscas no existe o ha sido eliminado del mapa.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/"
              className="bg-primary text-white font-black uppercase tracking-wider px-8 py-3 transform -skew-x-12 hover:bg-white hover:text-primary transition-colors border-2 border-primary"
            >
              <span className="transform skew-x-12 flex items-center gap-2">
                <Home size={20} /> Ir al Inicio
              </span>
            </Link>
            
            <button 
              onClick={() => window.history.back()}
              className="bg-transparent text-white font-black uppercase tracking-wider px-8 py-3 transform -skew-x-12 hover:bg-white/10 transition-colors border-2 border-white"
            >
              <span className="transform skew-x-12 flex items-center gap-2">
                <Map size={20} /> Volver Atrás
              </span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;