// Ubicación: frontend/src/pages/Cart.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCartStore();
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
        <h2 className="text-4xl font-black uppercase tracking-tighter mb-6">Tu bolsa está vacía</h2>
        <Link to="/" className="border-b-2 border-black pb-1 font-bold uppercase text-sm tracking-widest hover:text-gray-500 hover:border-gray-500 transition-all">
          Explorar Novedades
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-12 border-b border-black pb-6">Bolsa de Compras</h1>
        
        <div className="space-y-8 mb-12">
          {cart.map((item) => (
            <div key={item.id} className="flex gap-6 border-b border-gray-100 pb-8 items-center">
              <img src={item.image_url} alt={item.name} className="w-24 h-32 object-cover bg-gray-50" />
              <div className="flex-grow">
                <h3 className="font-bold uppercase text-sm tracking-tight">{item.name}</h3>
                <p className="text-gray-400 text-xs uppercase mb-4">{item.category_name}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-200">
                    <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="p-2 hover:bg-gray-50"><Minus size={14}/></button>
                    <span className="px-4 font-bold text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 hover:bg-gray-50"><Plus size={14}/></button>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-sm mb-4">${item.price * item.quantity}</p>
                <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 p-8">
          <div className="flex justify-between items-end mb-8">
            <span className="text-gray-500 uppercase text-xs font-bold tracking-widest">Total Estimado</span>
            <span className="text-3xl font-black">${total}</span>
          </div>
          <Link to="/checkout" className="w-full bg-black text-white py-5 flex items-center justify-center gap-3 font-bold uppercase text-sm tracking-widest hover:bg-gray-800 transition-all">
            Finalizar Pedido <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;