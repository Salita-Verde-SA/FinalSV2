import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Search, Bike } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const cartItems = useCartStore(state => state.cart);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  
  const { user, isAuthenticated, logout, isAdmin } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // AHORA: Cada link puede tener una categoría específica para activar
  const navLinks = [
    { name: 'Inicio', id: 'inicio' },
    { name: 'Categorías', id: 'categorias' },
    { name: 'Productos', id: 'tienda', category: 'Todos' } // <-- Activará "Todos"
  ];

  const handleNavigation = (item) => {
    setIsMenuOpen(false);
    
    // Construimos la URL base
    let targetPath = '/';
    
    // Si el link tiene una categoría específica (como Productos -> Todos), la agregamos a la URL
    if (item.category) {
      targetPath += `?category=${item.category}`;
    }

    // Navegación
    if (location.pathname !== '/' || item.category) {
      navigate(targetPath);
      // Damos un momento para que la navegación ocurra antes de scrollear
      setTimeout(() => {
        const element = document.getElementById(item.id);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    } else {
      // Si ya estamos en home y no hay cambio de categoría, solo scroll
      const element = document.getElementById(item.id);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setShowSearch(false);
      navigate(`/?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-white shadow-sm border-b border-ui-border">
        <div className="bg-text-primary text-xs text-white py-1 text-center font-medium tracking-wide uppercase">
          Hasta 6 cuotas sin interés en toda la tienda • <span className="text-primary font-bold">Envíos a todo el país</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link 
              to="/" 
              onClick={() => { setSearchTerm(''); window.scrollTo({top: 0, behavior: 'smooth'}); }} 
              className="flex items-center gap-2 group"
            >
              <div className="bg-primary p-1.5 rounded-lg transform -skew-x-12 group-hover:skew-x-0 transition-transform duration-300">
                <Bike size={24} className="text-white" />
              </div>
              <span className="font-extrabold text-xl italic tracking-tighter text-text-primary">
                VELO<span className="text-primary">RACE</span>
              </span>
            </Link>

            <nav className="hidden md:flex space-x-8">
              {navLinks.map((item) => (
                <button 
                  key={item.name}
                  onClick={() => handleNavigation(item)} 
                  className="text-text-primary hover:text-primary font-bold transition-colors text-sm uppercase tracking-wider relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full skew-x-12"></span>
                </button>
              ))}
            </nav>

            <div className="hidden md:flex items-center space-x-5">
              <div className="relative flex items-center">
                <AnimatePresence>
                  {showSearch && (
                    <motion.form 
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 200, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      onSubmit={handleSearchSubmit}
                      className="absolute right-8 top-1/2 -translate-y-1/2"
                    >
                      <input
                        autoFocus
                        type="text"
                        placeholder="Buscar equipo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-3 pr-8 py-1.5 rounded-md border border-ui-border bg-surface focus:border-primary text-sm focus:ring-1 focus:ring-primary outline-none"
                      />
                    </motion.form>
                  )}
                </AnimatePresence>
                <button 
                  onClick={() => setShowSearch(!showSearch)} 
                  className="text-text-secondary hover:text-primary transition-colors"
                >
                  <Search size={20} strokeWidth={2.5} />
                </button>
              </div>
              
              <Link to="/cart" className="relative text-text-secondary hover:text-primary transition-colors">
                <ShoppingCart size={20} strokeWidth={2.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {cartCount}
                  </span>
                )}
              </Link>

              {isAuthenticated ? (
                <div className="flex items-center gap-3 pl-4 border-l-2 border-ui-border/50">
                   {isAdmin && (
                     <Link to="/admin" className="text-[10px] font-black uppercase text-primary border border-primary px-2 py-0.5 rounded hover:bg-primary hover:text-white transition-all">
                       Panel
                     </Link>
                   )}
                   <Link to="/profile" className="flex items-center gap-2 font-bold text-sm text-text-primary hover:text-primary transition-colors">
                      <User size={20} />
                      <span className="hidden lg:inline">{user?.name?.split(' ')[0]}</span>
                   </Link>
                </div>
              ) : (
                <Link to="/login" className="text-sm font-bold text-white bg-text-primary px-4 py-2 rounded transform -skew-x-12 hover:bg-primary transition-colors shadow-lg hover:shadow-primary/30">
                  <span className="transform skew-x-12 inline-block">INGRESAR</span>
                </Link>
              )}
            </div>

            <div className="md:hidden flex items-center gap-4">
              <Link to="/cart" className="relative text-text-primary">
                 <ShoppingCart size={24} />
                 {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-primary text-white w-2 h-2 rounded-full"></span>}
              </Link>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-text-primary">
                {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-16 left-0 w-full bg-white border-b border-ui-border md:hidden z-40"
          >
            <div className="p-4 space-y-4">
               <form onSubmit={handleSearchSubmit}>
                 <input
                    type="text"
                    placeholder="Buscar repuestos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 rounded border border-ui-border bg-surface font-medium"
                  />
               </form>
               <div className="grid grid-cols-1 gap-2">
                {navLinks.map((item) => (
                  <button key={item.name} onClick={() => handleNavigation(item)} className="text-left font-bold text-lg text-text-primary uppercase py-2 border-b border-surface">
                    {item.name}
                  </button>
                ))}
               </div>
               {isAuthenticated && (
                  <button onClick={() => {logout(); setIsMenuOpen(false);}} className="w-full text-left font-bold text-red-500 py-2">
                    SALIR
                  </button>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;