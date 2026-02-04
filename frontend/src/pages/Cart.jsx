import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ArrowLeft, ArrowRight, ShoppingBag, Minus, Plus } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const totalPrice = getTotalPrice();
  const shippingCost = totalPrice > 500 ? 0 : 25;
  const finalTotal = totalPrice + shippingCost;

  const handleCheckout = () => {
    if (isAuthenticated) {
      navigate('/checkout');
    } else {
      navigate('/login');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#0f1115] flex flex-col items-center justify-center px-4 relative">
        <div className="absolute inset-0 bg-brand-accent/5 blur-[150px] pointer-events-none"></div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center relative z-10">
          <div className="w-24 h-24 bg-[#16191e] border border-white/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <ShoppingBag size={32} className="text-white/20" />
          </div>
          <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">Sin Carga</h2>
          <p className="text-gray-500 font-mono text-sm mb-8 uppercase tracking-widest">Tu equipo está vacío. Inicia la configuración.</p>
          <Link to="/" className="inline-flex items-center gap-2 text-brand-accent border-b border-brand-accent pb-1 font-bold uppercase text-xs tracking-[0.2em] hover:text-white hover:border-white transition-all">
            <ArrowLeft size={14} /> Volver al Catálogo
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1115] text-gray-200 pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-end mb-12 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter leading-none">
              Tu <span className="text-brand-accent">Equipo</span>
            </h1>
            <p className="text-[10px] font-mono text-gray-500 mt-2 uppercase tracking-[0.3em]">
              {cart.length} Componentes seleccionados
            </p>
          </div>
          <button 
            onClick={clearCart} 
            className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2"
          >
            <Trash2 size={14} /> Vaciar Todo
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Lista de Items */}
          <div className="lg:col-span-8 space-y-4">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div 
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="bg-[#16191e] border border-white/5 p-6 flex flex-col sm:flex-row items-center gap-6 group hover:border-white/10 transition-colors"
                >
                  <div className="w-24 h-24 bg-black flex items-center justify-center shrink-0 border border-white/5">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-80" />
                    ) : (
                      <span className="text-2xl font-black text-white/10 italic">{item.name.substring(0,2)}</span>
                    )}
                  </div>
                  
                  <div className="flex-grow text-center sm:text-left">
                    <div className="text-[10px] font-mono text-brand-accent uppercase mb-1">REF: {item.id}</div>
                    <h3 className="text-xl font-black text-white uppercase italic leading-none mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-500 font-medium">${item.price.toLocaleString('es-AR')}</p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center bg-[#0f1115] border border-white/10 h-10">
                      <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="w-10 h-full flex items-center justify-center hover:bg-white/10 transition-colors"><Minus size={14}/></button>
                      <span className="w-10 text-center font-mono font-bold text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, Math.min(item.stock, item.quantity + 1))} className="w-10 h-full flex items-center justify-center hover:bg-white/10 transition-colors"><Plus size={14}/></button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-gray-600 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Resumen de Compra */}
          <div className="lg:col-span-4">
            <div className="bg-[#16191e] border border-white/10 p-8 sticky top-24">
              <h3 className="text-xl font-black text-white uppercase italic mb-8 flex items-center gap-2">
                <span className="w-1 h-6 bg-brand-accent inline-block skew-x-[-12deg]"></span> Resumen
              </h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm uppercase tracking-wider text-gray-400">
                  <span>Subtotal</span>
                  <span className="text-white font-mono">${totalPrice.toLocaleString('es-AR')}</span>
                </div>
                <div className="flex justify-between text-sm uppercase tracking-wider text-gray-400">
                  <span>Logística</span>
                  {shippingCost === 0 ? (
                    <span className="text-brand-accent font-black">GRATIS</span>
                  ) : (
                    <span className="text-white font-mono">${shippingCost.toFixed(2)}</span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-end mb-8 pt-6 border-t border-white/10">
                <span className="text-lg font-black text-white uppercase italic">Total Final</span>
                <span className="text-3xl font-black text-brand-accent tracking-tighter leading-none">
                  ${finalTotal.toLocaleString('es-AR')}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-white text-black hover:bg-brand-accent py-5 font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3 group"
              >
                {isAuthenticated ? 'Procesar Pago' : 'Login para Pagar'} 
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;