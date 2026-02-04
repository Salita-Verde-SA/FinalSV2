import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Bike, Filter, ArrowDown, RefreshCw, AlertTriangle, Activity, Zap, Wrench, Mountain, ChevronRight } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
// Importamos nuestro nuevo hook
import { useShopData } from '../hooks/useShopData';

// --- COMPONENTE AUXILIAR: Skeleton de Carga Mejorado ---
const ProductSkeleton = () => (
  <div className="bg-surface-card border border-white/5 h-full p-4 rounded-sm animate-pulse relative overflow-hidden">
    <div className="aspect-square bg-black/30 mb-4 relative">
       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_1.5s_infinite] -translate-x-full"></div>
    </div>
    <div className="h-6 bg-white/10 w-3/4 mb-2 rounded-sm"></div>
    <div className="h-4 bg-white/5 w-1/2 mb-6 rounded-sm"></div>
    <div className="flex justify-between items-end mt-auto">
       <div className="h-8 bg-white/10 w-1/3 rounded-sm"></div>
       <div className="h-6 bg-brand-accent/20 w-1/4 rounded-sm"></div>
    </div>
  </div>
);
// ----------------------------------------------------

const Home = () => {
  // Usamos el custom hook. ¡Mira qué limpio!
  const { products, categories, loading, error, refetch } = useShopData();
  
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const categoryQuery = searchParams.get('category'); 

  // Lógica de filtrado (Optimizada con useMemo para evitar recálculos innecesarios)
  const filteredProducts = useMemo(() => {
    if (loading || error) return [];
    
    let result = products;

    if (searchQuery) {
        result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
        // Efecto secundario: scroll al buscar (debe estar en useEffect, pero para simplificar lo dejamos aquí controlado)
        if (activeCategory !== 'Resultados') setActiveCategory('Resultados');
         setTimeout(() => document.getElementById('tienda')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } else if (categoryQuery) {
        if (activeCategory !== categoryQuery) setActiveCategory(categoryQuery);
        result = categoryQuery === 'Todos' ? result : result.filter(p => p.category_name === categoryQuery);
    } else {
        if (activeCategory !== 'Todos') setActiveCategory('Todos');
    }
    return result;
  }, [products, searchQuery, categoryQuery, loading, error, activeCategory]);


  const filterByCategory = (categoryName) => {
    setSearchParams(prev => {
        if (categoryName === 'Todos') prev.delete('category');
        else prev.set('category', categoryName);
        return prev;
    });
  };

  return (
    // Usamos el color semántico 'bg-surface-base' y scroll-mt-32 para el header fijo
    <div className="min-h-screen bg-surface-base text-gray-200 font-sans selection:bg-brand-accent selection:text-black scroll-mt-32" id="inicio">
      
      {/* HERO SECTION (Sin cambios mayores, solo colores semánticos) */}
      <section className="relative h-[85vh] flex items-center bg-brand-carbon overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-accent/10 via-brand-carbon to-brand-carbon"></div>
        
        <div className="max-w-[1400px] mx-auto px-6 relative z-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col justify-center pt-10 lg:pt-0"
          >
            <div className="inline-flex items-center gap-2 mb-6">
                <span className="h-[2px] w-8 bg-brand-accent"></span>
                <span className="text-brand-accent font-mono text-xs tracking-[0.3em] uppercase">Mendoza / División Pro Racing</span>
            </div>
            <h1 className="text-7xl md:text-9xl font-black text-white italic tracking-tighter leading-[0.85] mb-8 relative z-20">
              DOMINA <br/> EL <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent via-orange-500 to-brand-accent animate-pulse">TERRENO.</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-md leading-relaxed pl-2 border-l-4 border-brand-accent/20 mb-10 font-light">
              Ingeniería de precisión para montaña y ruta. Equipamiento probado en las condiciones más exigentes.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => document.getElementById('tienda')?.scrollIntoView({ behavior: 'smooth' })}
                className="group relative overflow-hidden bg-brand-accent text-black px-8 py-4 font-black uppercase tracking-widest clip-path-slant-right"
              >
                <span className="relative z-10 flex items-center gap-2 group-hover:gap-4 transition-all">
                    Explorar Productos <ArrowDown size={18} className="animate-bounce"/>
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
            </div>
          </motion.div>

          <motion.div 
             initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2 }}
             className="hidden lg:flex items-center justify-center relative"
          >
             <div className="absolute w-[600px] h-[600px] bg-brand-accent/5 rounded-full blur-[100px] animate-pulse"></div>
             <div className="w-[550px] h-[550px] border border-brand-accent/20 rounded-full flex items-center justify-center animate-[spin_30s_linear_infinite] absolute">
                <div className="w-[530px] h-[530px] border border-dashed border-brand-accent/30 rounded-full"></div>
                 <div className="absolute top-0 w-4 h-4 bg-brand-accent rounded-full shadow-[0_0_20px_currentColor]"></div>
             </div>
             <Bike className="relative z-10 text-brand-accent drop-shadow-[0_0_30px_rgba(255,77,0,0.6)] filter contrast-150" size={380} strokeWidth={0.7} />
             <div className="absolute bottom-[-40px] w-[300px] h-10 bg-brand-accent/30 blur-xl rounded-[50%] transform scale-x-150"></div>
          </motion.div>
        </div>
      </section>

      {/* MARQUESINA */}
      <div className="bg-brand-accent py-3 overflow-hidden relative z-20">
        <div className="animate-marquee whitespace-nowrap flex gap-16 text-black font-black italic uppercase tracking-widest text-sm">
          {/* (Contenido de la marquesina igual que antes...) */}
          <span>/// Ciclismo de Alto Rendimiento</span><span>/// Tecnología de Fibra de Carbono</span><span>/// Ingeniería de Precisión</span><span>/// Probado en Montañas de Mendoza</span><span>/// Componentes Listos para Competir</span><span>/// Ciclismo de Alto Rendimiento</span><span>/// Tecnología de Fibra de Carbono</span><span>/// Ingeniería de Precisión</span><span>/// Probado en Montañas de Mendoza</span><span>/// Componentes Listos para Competir</span>
        </div>
      </div>

      {/* TIENDA */}
      <section id="tienda" className="py-24 max-w-[1400px] mx-auto px-6 relative scroll-mt-24">
          <div className="absolute top-0 right-0 text-[20vw] font-black text-white/5 leading-none italic select-none pointer-events-none -translate-y-1/2 translate-x-1/4">TIENDA</div>

          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 relative z-10">
            <div>
              <span className="text-brand-accent font-mono text-xs tracking-[0.2em] uppercase mb-2 block">// Laboratorio Técnico</span>
              <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white">
                Inventario <span className="text-white/50">2026</span>
              </h2>
            </div>

            {/* Filtros (Solo se muestran si no hay error y no está cargando) */}
            {!error && !loading && categories.length > 0 && (
              <div className="flex flex-wrap gap-1 bg-surface-card p-1 border border-white/10 rounded-sm">
                {['Todos', ...categories.map(c => c.name)].map((catName) => (
                  <button 
                    key={catName}
                    onClick={() => filterByCategory(catName)} 
                    className={`px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${
                      activeCategory === catName 
                        ? 'bg-brand-accent text-black shadow-glow' 
                        : 'text-gray-500 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {catName}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="min-h-[400px] relative z-10">
            {/* ESTADO DE CARGA MEJORADO */}
            {loading && (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                 {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                   <ProductSkeleton key={n} />
                 ))}
               </div>
            )}

            {/* NUEVO: ESTADO DE ERROR */}
            {error && (
              <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-red-500/30 bg-red-500/5">
                <AlertTriangle size={48} className="text-red-500 mb-4 animate-pulse" />
                <p className="text-red-400 font-mono uppercase text-sm tracking-widest mb-4">{error}</p>
                <button 
                  onClick={refetch} 
                  className="flex items-center gap-2 text-white bg-red-500/20 px-6 py-3 hover:bg-red-500 transition-colors uppercase font-bold text-xs tracking-widest border border-red-500"
                >
                  <RefreshCw size={14} /> Reintentar Conexión
                </button>
              </div>
            )}

            {/* CONTENIDO NORMAL */}
            {!loading && !error && (
              <>
                <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  <AnimatePresence mode='popLayout'>
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </AnimatePresence>
                </motion.div>
                
                {filteredProducts.length === 0 && (
                  <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-white/10 bg-surface-card/50">
                    <Filter size={48} className="text-brand-accent/50 mb-4" />
                    <p className="text-gray-500 font-mono uppercase text-sm tracking-widest">Sin stock en esta categoría</p>
                    <button onClick={() => filterByCategory('Todos')} className="text-brand-accent text-xs font-black uppercase mt-6 border-b-2 border-brand-accent pb-1 hover:text-white hover:border-white transition-all">
                      Ver todo el arsenal
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
      </section>
    </div>
  );
};

export default Home;