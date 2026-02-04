import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';

const OrderSuccess = () => {
  return (
    <div className="min-h-screen bg-[#0f1115] flex flex-col items-center justify-center text-center p-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-500/10 via-[#0f1115] to-[#0f1115] opacity-50"></div>
      
      <div className="relative z-10 bg-[#16191e] border border-white/10 p-12 max-w-lg w-full">
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 border border-green-500/20">
            <CheckCircle2 size={48} />
          </div>
        </div>
        
        <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">
          ¡Orden <span className="text-green-500">Confirmada!</span>
        </h1>
        
        <p className="text-gray-400 mb-10 font-mono text-sm">
          Tu equipamiento está asegurado y en proceso de preparación. Te notificaremos cuando salga a pista.
        </p>
        
        <div className="flex flex-col gap-4">
          <Link 
            to="/profile" 
            className="bg-white text-black px-6 py-4 font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            Seguir Pedido <ArrowRight size={18} />
          </Link>
          <Link 
            to="/" 
            className="bg-transparent border border-white/10 text-gray-500 px-6 py-4 font-bold uppercase tracking-widest hover:border-white hover:text-white transition-colors text-xs"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;