// Ubicación: frontend/src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Shield, Truck, Tag, Shirt } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Todos');
  
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  // Función para scroll suave (La que faltaba)
  const scrollToProducts = () => {
    const element = document.getElementById('productos');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodData, catData] = await Promise.all([
          productService.getAll(),
          categoryService.getAll()
        ]);
        
        const productsWithCategories = prodData.map(product => {
          const category = catData.find(c => c.id === product.category_id);
          return {
            ...product,
            category_name: category ? category.name : 'Sin categoría'
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

  useEffect(() => {
    if (products.length > 0) {
      if (searchQuery) {
        const filtered = products.filter(p => 
          p.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredProducts(filtered);
        setActiveCategory('Resultados');
        setTimeout(scrollToProducts, 100);
      } else {
        setFilteredProducts(products);
        setActiveCategory('Todos');
      }
    }
  }, [searchQuery, products]);

  const filterByCategory = (categoryName) => {
    setActiveCategory(categoryName);
    if (categoryName === 'Todos') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(p => p.category_name === categoryName);
      setFilteredProducts(filtered);
    }
  };

  return (
    <div className="min-h-screen bg-white" id="inicio">
      {/* HERO SECTION */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="uppercase tracking-[0.4em] text-xs font-bold text-gray-400 mb-6 block">
              Temporada 2026 / Urban Look
            </span>
            <h1 className="text-7xl md:text-9xl font-black text-black mb-8 tracking-tighter uppercase leading-none">
              Viste <br />
              <span className="text-gray-300">Tu Esencia</span>
            </h1>
            <button 
              onClick={scrollToProducts}
              className="bg-black text-white px-14 py-5 rounded-none font-bold uppercase text-sm tracking-widest hover:bg-gray-800 transition-all shadow-xl"
            >
              Explorar Colección
            </button>
          </motion.div>
        </div>
      </section>

      {/* PRODUCT CATALOG */}
      <section id="productos" className="max-w-7xl mx-auto px-4 py-24">
        <div className="flex flex-col items-center mb-16 text-center">
          <h2 className="text-5xl font-black uppercase tracking-tighter mb-4">Catálogo</h2>
          <div className="h-1 w-20 bg-black"></div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(n => <div key={n} className="bg-gray-100 animate-pulse h-80"></div>)}
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            <AnimatePresence>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>
    </div>
  );
};

export default Home;