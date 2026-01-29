import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Plus, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartStore } from '../../store/useCartStore';

const ProductCard = ({ product }) => {
  const addToCart = useCartStore((state) => state.addToCart);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      layout
      className="group bg-white border border-ui-border hover:border-primary/50 transition-all duration-300 flex flex-col relative overflow-hidden shadow-sm hover:shadow-md"
    >
      {/* Etiqueta de Categoría Flotante */}
      <div className="absolute top-0 left-0 bg-text-primary text-white text-[10px] font-bold uppercase px-3 py-1 z-10">
        {product.category_name}
      </div>

      {/* Imagen Placeholder Técnica */}
      <div className="aspect-[4/3] bg-surface relative flex items-center justify-center overflow-hidden border-b border-ui-border group-hover:bg-gray-100 transition-colors">
        {/* Usamos las iniciales como "Marca" */}
        <span className="text-6xl font-black text-ui-border/50 select-none group-hover:scale-110 transition-transform duration-500 italic">
           {product.name.substring(0, 2).toUpperCase()}
        </span>
        
        {/* Acciones Rápidas */}
        <div className="absolute bottom-2 right-2 flex gap-2 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
           <Link to={`/product/${product.id}`} className="p-2 bg-white border border-ui-border rounded hover:bg-text-primary hover:text-white hover:border-text-primary text-text-primary transition-colors">
              <Info size={18} />
           </Link>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-text-primary uppercase tracking-tight leading-tight line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        
        <div className="mt-auto flex items-end justify-between border-t border-ui-border pt-3">
          <div className="flex flex-col">
             <span className="text-[10px] text-text-secondary font-bold uppercase">Precio Contado</span>
             <span className="text-xl font-black text-text-primary tracking-tight">
               ${product.price.toLocaleString('es-AR')}
             </span>
          </div>
          
          <button 
            onClick={() => addToCart(product)} 
            disabled={product.stock === 0}
            className="bg-primary text-white p-2 rounded-sm hover:bg-primary-hover disabled:bg-gray-300 transition-colors transform active:scale-95"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
        
        <div className="flex justify-between items-center mt-2 text-[10px] font-medium text-text-secondary uppercase">
           <span>Stock: {product.stock > 0 ? product.stock : 'Sin Stock'}</span>
           {product.stock > 0 ? (
             <span className="text-green-600 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-600"></div> Disponible</span>
           ) : (
             <span className="text-red-500">Agotado</span>
           )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;