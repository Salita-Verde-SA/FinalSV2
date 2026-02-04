import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, Box } from 'lucide-react';

const ProductCard = ({ product }) => {
  const placeholderInitials = product.name.substring(0, 2).toUpperCase();
  const hasStock = product.stock > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }} // Easing suave "pop"
      className="h-full"
    >
      {/* ENLACE TOTAL: Envuelve toda la tarjeta */}
      <Link
        to={`/product/${product.id}`}
        className="group relative block h-full overflow-hidden bg-[#16191e] border border-brand-accent/30 hover:border-brand-accent transition-all duration-500 shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_40px_rgba(255,77,0,0.3)] rounded-sm"
      >
        {/* Luz de fondo naranja sutil al hacer hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

        {/* Contenedor de Imagen / Placeholder */}
        <div className="relative aspect-square overflow-hidden bg-[#0a0a0b] m-2 border border-white/5 group-hover:border-brand-accent/50 transition-colors relative z-10">
          {/* Etiqueta de Categoría Flotante */}
          <div className="absolute top-3 left-3 z-20 bg-black/80 border-l-2 border-brand-accent backdrop-blur-md text-[9px] font-black uppercase tracking-widest px-3 py-1 text-white">
             {product.category_name}
          </div>

          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-1"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
               {/* Efecto de "Núcleo de Energía" para el placeholder */}
               <div className="absolute inset-0 bg-brand-accent/10 blur-3xl animate-pulse"></div>
               <Box size={48} className="text-brand-accent/20 absolute mb-8 animate-pulse"/>
               <span className="text-7xl font-black italic text-white/10 group-hover:text-brand-accent/40 transition-colors relative z-10 select-none">
                {placeholderInitials}
               </span>
            </div>
          )}
          
          {/* Overlay de "Agotado" si aplica */}
          {!hasStock && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-30 flex items-center justify-center border-2 border-red-500 m-1">
               <span className="text-red-500 font-black uppercase italic tracking-widest text-xl rotate-[-12deg] border-y-2 border-red-500 py-2 px-4">
                 Agotado
               </span>
            </div>
          )}
        </div>

        {/* Información del Producto */}
        <div className="p-5 relative z-10 flex flex-col h-[calc(100%-aspect-square-1rem)]">
          <div className="flex-grow">
             <div className="flex justify-between items-start gap-4 mb-3">
                <h3 className="text-lg font-black uppercase italic leading-none text-white group-hover:text-brand-accent transition-colors line-clamp-2">
                  {product.name}
                </h3>
                {/* Icono indicador visual (ya no es el único botón) */}
                <div className={`w-8 h-8 shrink-0 flex items-center justify-center transition-all rounded-sm ${hasStock ? 'bg-brand-accent text-black group-hover:bg-white' : 'bg-white/10 text-gray-500'}`}>
                   <ArrowUpRight size={18} strokeWidth={3} />
                </div>
             </div>

             <p className="text-xs text-gray-500 font-mono line-clamp-2 mb-4 opacity-70 group-hover:opacity-100 transition-opacity">
               {product.description || 'Especificaciones de alto rendimiento lista para competición.'}
             </p>
          </div>

          {/* Footer con Precio y Stock */}
          <div className="flex items-end justify-between border-t border-white/10 pt-4 mt-auto group-hover:border-brand-accent/30 transition-colors">
             <div>
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Valor Contado</p>
                <p className="text-3xl font-black italic tracking-tighter text-white group-hover:text-brand-accent transition-colors leading-none">
                   ${product.price.toLocaleString('es-AR')}
                </p>
             </div>
             <div className="text-right flex flex-col items-end justify-end h-full">
                {hasStock ? (
                   <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase text-green-400 tracking-widest bg-green-400/10 px-2 py-1 rounded-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_5px_lime] animate-pulse"></div> Disponible
                   </span>
                ) : (
                   <span className="text-[9px] font-bold uppercase text-red-500 tracking-widest bg-red-500/10 px-2 py-1 rounded-sm">
                      Sin Stock
                   </span>
                )}
             </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;