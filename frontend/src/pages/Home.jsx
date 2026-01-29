import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { ArrowRight, Activity, Zap, Wrench, Mountain, Bike } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Todos');
  
  // Hook para leer los parámetros de la URL (ej: ?category=Todos)
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const categoryQuery = searchParams.get('category'); 

  // 1. Carga inicial de datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodData, catData] = await Promise.all([
          productService.getAll(),
          categoryService.getAll()
        ]);
        
        // Unimos productos con los nombres de sus categorías
        const productsWithCategories = prodData.map(product => {
          const category = catData.find(c => c.id === product.category_id);
          return {
            ...product,
            category_name: category ? category.name : 'Componentes'
          };
        });

        setProducts(productsWithCategories);
        setCategories(catData);
        setFilteredProducts(productsWithCategories);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

 // 2. Efecto unificado para filtrar cuando cambia la Búsqueda o la Categoría en la URL
  useEffect(() => {
    if (products.length > 0) {
      if (searchQuery) {
        // Prioridad 1: Si hay búsqueda, filtramos por nombre
        setFilteredProducts(products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())));
        setActiveCategory('Resultados');
        // Pequeño delay para asegurar que el DOM está listo antes de scrollear
        setTimeout(() => document.getElementById('tienda')?.scrollIntoView({ behavior: 'smooth' }), 100);
      } else if (categoryQuery) {
        // Prioridad 2: Si hay categoría en la URL (ej: click en "Productos" del header)
        setActiveCategory(categoryQuery); // Activamos visualmente la pestaña
        if (categoryQuery === 'Todos') {
          setFilteredProducts(products);
        } else {
          setFilteredProducts(products.filter(p => p.category_name === categoryQuery));
        }
        
        // Scrolleamos a la tienda si se seleccionó una categoría específica desde fuera
        // El timeout ayuda a que la UI se renderice antes del scroll
        setTimeout(() => document.getElementById('tienda')?.scrollIntoView({ behavior: 'smooth' }), 100);
        
      } else {
        // Prioridad 3: Estado por defecto (Home limpio al entrar por primera vez)
        setFilteredProducts(products);
        setActiveCategory('Todos');
      }
    }
  }, [searchQuery, categoryQuery, products]);

  // Función para cuando el usuario hace click manual en las pestañas de categoría
  const filterByCategory = (categoryName) => {
    // Actualizamos la URL para mantener consistencia con el navegador
    setSearchParams(prev => {
        if (categoryName === 'Todos') {
            prev.delete('category'); // Limpia la URL si es 'Todos'
            return prev;
        } else {
            prev.set('category', categoryName); // Pone ?category=X
            return prev;
        }
    });
    // El useEffect de arriba se encargará de filtrar al detectar el cambio en searchParams
    setActiveCategory(categoryName);
  };
  return (
    <div className="min-h-screen bg-surface" id="inicio">
      
      {/* HERO SECTION DEPORTIVA */}
      <section className="relative pt-32 pb-24 overflow-hidden bg-text-primary text-white">
        {/* Patrón de fondo estilo topográfico */}
        <div className="absolute inset-0 opacity-10 bg-topo-pattern"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/20 to-transparent skew-x-12 translate-x-10"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -50 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.6 }}
            className="flex-1 text-center md:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-white text-xs font-bold uppercase tracking-widest mb-6 rounded-sm transform -skew-x-12">
              <Zap size={14} fill="currentColor" /> Performance Series 2026
            </div>
<h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-none mb-8"> DOMINA <br/> {/* --- CAMBIO AQUÍ: Gradiente más agresivo y sombra --- */} <span className="relative inline-block"> EL TERRENO </span>
</h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-lg leading-relaxed mb-8">
              Equipamiento profesional para MTB, Ruta y Urbano. Mejora tus tiempos y conquista nuevas rutas con lo mejor en tecnología ciclista.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button 
                onClick={() => { filterByCategory('Todos'); document.getElementById('tienda')?.scrollIntoView({ behavior: 'smooth' }); }} 
                className="bg-primary text-white px-8 py-4 font-bold uppercase tracking-wider hover:bg-white hover:text-primary transition-colors border-2 border-primary transform -skew-x-12"
              >
                <span className="transform skew-x-12 inline-block">Ver Catálogo</span>
              </button>
              <a 
  href="https://wa.me/5492616802627?text=Hola,%20me%20interesa%20el%20servicio%20técnico%20de%20VeloRace." 
  target="_blank" 
  rel="noopener noreferrer"
  className="bg-transparent text-white px-8 py-4 font-bold uppercase tracking-wider hover:bg-white/10 transition-colors border-2 border-white transform -skew-x-12 inline-flex items-center justify-center no-underline"
>
  <span className="transform skew-x-12 inline-block">Servicio Técnico</span>
</a>
            </div>
          </motion.div>
          
          {/* Decoración Visual Derecha (Icono abstracto de rueda) */}
          <div className="hidden md:flex flex-1 justify-center items-center">
             <div className="w-80 h-80 rounded-full border-[16px] border-primary/20 border-t-primary animate-spin-[10s_linear_infinite] flex items-center justify-center relative">
               <div className="absolute inset-0 flex items-center justify-center">
                 <Bike size={120} className="text-white opacity-80" />
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* BARRA DE VENTAJAS */}
      <div className="bg-white border-b border-ui-border relative z-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-ui-border">
          {[
            { icon: Activity, title: "Ajuste Biomecánico", desc: "Optimiza tu postura" },
            { icon: Wrench, title: "Taller Especializado", desc: "Certificado Shimano" },
            { icon: Mountain, title: "Pruebas en Terreno", desc: "Garantía real de uso" },
          ].map((item, idx) => {
             const Icon = item.icon;
             return (
              <div key={idx} className="flex items-center justify-center gap-4 p-8 hover:bg-surface transition-colors group">
                <div className="p-3 bg-primary/10 rounded-full text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <Icon size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-text-primary uppercase text-sm tracking-wide">{item.title}</h3>
                  <p className="text-text-secondary text-xs">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <section id="categorias" className="py-16 max-w-7xl mx-auto px-6">
         <div className="flex flex-col md:flex-row justify-between items-center mb-10 border-b-2 border-ui-border pb-4">
            <h2 className="text-2xl font-black uppercase text-text-primary tracking-tight flex items-center gap-2">
              <span className="w-2 h-8 bg-primary block transform -skew-x-12"></span> Explorar Equipo
            </h2>
            <div className="flex gap-2 mt-4 md:mt-0 overflow-x-auto pb-2 w-full md:w-auto">
              {/* Pestañas de Categorías */}
              {['Todos', ...categories.map(c => c.name)].map((catName) => (
                <button 
                  key={catName}
                  onClick={() => filterByCategory(catName)} 
                  className={`px-5 py-2 text-xs font-bold uppercase tracking-wider border-2 transition-all transform -skew-x-12 ${
                    activeCategory === catName 
                      ? 'bg-text-primary text-white border-text-primary' 
                      : 'bg-transparent text-text-secondary border-ui-border hover:border-primary hover:text-primary'
                  }`}
                >
                  <span className="transform skew-x-12 inline-block whitespace-nowrap">{catName}</span>
                </button>
              ))}
            </div>
         </div>

         {/* GRID DE PRODUCTOS */}
         <div id="tienda" className="min-h-[400px]">
            {loading ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 {[1, 2, 3, 4].map(n => <div key={n} className="bg-white h-[350px] animate-pulse rounded border border-ui-border"></div>)}
               </div>
            ) : (
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <AnimatePresence>
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
            
            {filteredProducts.length === 0 && !loading && (
              <div className="text-center py-20 bg-white border border-dashed border-ui-border rounded-lg">
                <Bike size={48} className="mx-auto text-text-muted mb-4" />
                <p className="text-text-secondary font-medium">No hay equipamiento disponible en esta categoría.</p>
                <button onClick={() => filterByCategory('Todos')} className="text-primary font-bold mt-2 uppercase text-sm hover:underline">Ver todo el inventario</button>
              </div>
            )}
         </div>
      </section>
    </div>
  );
};

export default Home;