import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ArrowLeft, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import CartItem from '../components/cart/CartItem';

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
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-surface px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-ui-border text-text-muted">
            <ShoppingBag size={32} />
          </div>
          <h2 className="text-3xl font-black italic text-text-primary mb-2 uppercase tracking-tighter">Tu Garage está vacío</h2>
          <p className="text-text-secondary mb-8 font-medium">Prepara tu equipo para la próxima salida.</p>
          <Link to="/" className="inline-flex items-center gap-2 bg-primary text-white font-bold uppercase tracking-wider px-8 py-3 transform -skew-x-12 hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20">
            <span className="transform skew-x-12 flex items-center gap-2"><ArrowLeft size={18} /> Volver a la Tienda</span>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b-2 border-ui-border pb-4">
          <div>
            <h1 className="text-4xl font-black text-text-primary italic uppercase tracking-tighter">
              Equipamiento <span className="text-primary">.</span>
            </h1>
            <p className="text-text-secondary font-medium text-sm mt-1 uppercase tracking-wide">
              {cart.length} items seleccionados
            </p>
          </div>
          <button onClick={clearCart} className="text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-wider flex items-center gap-2 hover:bg-red-50 px-3 py-2 rounded transition-colors">
            <Trash2 size={14} /> Vaciar Todo
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de productos */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {cart.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </AnimatePresence>
          </div>

          {/* Resumen del pedido - Estilo "Ticket de Carrera" */}
          <div className="lg:col-span-1">
            <div className="bg-white border-2 border-ui-border p-6 sticky top-24">
              <div className="border-b-2 border-dashed border-ui-border pb-4 mb-6">
                 <h2 className="text-xl font-black text-text-primary uppercase italic tracking-tight">Resumen de Carrera</h2>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-text-secondary text-sm font-medium uppercase">
                  <span>Subtotal</span>
                  <span className="font-bold text-text-primary font-mono">${totalPrice.toLocaleString('es-AR')}</span>
                </div>
                <div className="flex justify-between text-text-secondary text-sm font-medium uppercase">
                  <span>Logística</span>
                  {shippingCost === 0 ? (
                    <span className="text-primary font-black">GRATIS</span>
                  ) : (
                    <span className="font-bold text-text-primary font-mono">${shippingCost.toFixed(2)}</span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-end mb-8 pt-4 border-t-2 border-primary">
                <span className="text-lg font-bold text-text-primary uppercase italic">Total Final</span>
                <span className="text-3xl font-black text-text-primary tracking-tighter leading-none">
                  ${finalTotal.toLocaleString('es-AR')}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-primary hover:bg-primary-hover text-white py-4 font-black uppercase tracking-widest text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isAuthenticated ? 'Iniciar Pago' : 'Ingresar para Comprar'} <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;