import React from 'react';
import { Trash2, Plus, Minus, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartStore } from '../../store/useCartStore';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCartStore();

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-white border border-ui-border hover:border-l-4 hover:border-l-primary transition-all shadow-sm"
    >
      {/* Thumbnail */}
      <div className="w-24 h-24 bg-surface flex items-center justify-center font-black text-3xl text-ui-border select-none border border-ui-border italic">
        {item.name.substring(0, 2).toUpperCase()}
      </div>

      <div className="flex-grow text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
           <Tag size={12} className="text-primary"/>
           <span className="text-[10px] font-bold uppercase tracking-wide text-text-secondary">{item.category_name}</span>
        </div>
        <h3 className="font-bold text-text-primary text-lg uppercase leading-tight mb-2">
          {item.name}
        </h3>
        <div className="font-black text-text-primary text-xl tracking-tight">
          ${item.price.toLocaleString('es-AR')}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center border border-ui-border h-10">
          <button 
            onClick={() => updateQuantity(item.id, item.quantity - 1)} 
            disabled={item.quantity <= 1} 
            className="w-8 h-full flex items-center justify-center hover:bg-surface text-text-secondary transition-colors"
          >
            <Minus size={14} />
          </button>
          <span className="w-10 text-center font-bold text-text-primary text-sm border-x border-ui-border flex items-center justify-center h-full">
            {item.quantity}
          </span>
          <button 
            onClick={() => updateQuantity(item.id, item.quantity + 1)} 
            disabled={item.quantity >= item.stock} 
            className="w-8 h-full flex items-center justify-center hover:bg-surface text-text-secondary transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>

        <button 
          onClick={() => removeFromCart(item.id)} 
          className="text-gray-400 hover:text-red-500 transition-colors p-2"
          title="Eliminar del equipo"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </motion.div>
  );
};

export default CartItem;