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

  const navLinks = [
    { name: 'Inicio', id: 'inicio' },
    { name: 'Categorías', id: 'categorias' },
    { name: 'Productos', id: 'tienda', category: 'Todos' }
  ];

  const handleNavigation = (item) => {
    setIsMenuOpen(false);
    let targetPath = '/';
    if (item.category) targetPath += `?category=${item.category}`;

    if (location.pathname !== '/' || item.category) {
      navigate(targetPath);
      setTimeout(() => {
        const element = document.getElementById(item.id);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    } else {
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
      <header className="fixed top-0 w-full z-50 bg-[#0a0a0b]/90 backdrop-blur-md border-b border-white/10 shadow-lg">
        {/* Top Bar Técnica */}
        <div className="bg-brand-accent text-black text-[10px] font-black uppercase tracking-[0.2em] py-1 text-center">
          Envío Nacional Bonificado • <span className="text-white bg-black px-1">PRO SHOP</span>
        </div>

        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link 
              to="/" 
              onClick={() => { setSearchTerm(''); window.scrollTo({top: 0, behavior: 'smooth'}); }} 
              className="flex items-center gap-3 group"
            >
              <div className="bg-white text-black p-2 transform -skew-x-12 group-hover:bg-brand-accent transition-colors duration-300">
                <Bike size={24} className="transform skew-x-12" />
              </div>
              <span className="font-black text-2xl italic tracking-tighter text-white">
                VELO<span className="text-brand-accent">RACE</span>
              </span>
            </Link>

            {/* Navegación Desktop */}
            <nav className="hidden md:flex space-x-10">
              {navLinks.map((item) => (
                <button 
                  key={item.name}
                  onClick={() => handleNavigation(item)} 
                  className="text-gray-400 hover:text-white font-bold transition-colors text-xs uppercase tracking-[0.2em] relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-brand-accent transition-all group-hover:w-full"></span>
                </button>
              ))}
            </nav>

            {/* Acciones */}
            <div className="hidden md:flex items-center space-x-6">
              {/* Buscador */}
              <div className="relative flex items-center">
                <AnimatePresence>
                  {showSearch && (
                    <motion.form 
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 240, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      onSubmit={handleSearchSubmit}
                      className="absolute right-10 top-1/2 -translate-y-1/2"
                    >
                      <input
                        autoFocus
                        type="text"
                        placeholder="BUSCAR COMPONENTE..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-4 pr-4 py-2 bg-[#16191e] border border-brand-accent text-white text-xs font-mono uppercase focus:outline-none placeholder-gray-600"
                      />
                    </motion.form>
                  )}
                </AnimatePresence>
                <button 
                  onClick={() => setShowSearch(!showSearch)} 
                  className={`text-gray-400 hover:text-brand-accent transition-colors ${showSearch ? 'text-brand-accent' : ''}`}
                >
                  <Search size={20} />
                </button>
              </div>
              
              {/* Carrito */}
              <Link to="/cart" className="relative text-gray-400 hover:text-brand-accent transition-colors group">
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-brand-accent text-black text-[10px] font-black w-5 h-5 flex items-center justify-center border border-[#0a0a0b]">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Usuario */}
              {isAuthenticated ? (
                <div className="flex items-center gap-4 pl-6 border-l border-white/10">
                   {isAdmin && (
                     <Link to="/admin" className="text-[10px] font-black uppercase text-brand-accent border border-brand-accent px-3 py-1 hover:bg-brand-accent hover:text-black transition-all">
                       Admin
                     </Link>
                   )}
                   <Link to="/profile" className="flex items-center gap-2 font-bold text-xs text-white hover:text-brand-accent transition-colors uppercase tracking-wider">
                      <User size={18} />
                      <span className="hidden lg:inline">{user?.name?.split(' ')[0]}</span>
                   </Link>
                </div>
              ) : (
                <Link to="/login" className="text-xs font-black text-black bg-white px-6 py-3 transform -skew-x-12 hover:bg-brand-accent transition-colors shadow-[4px_4px_0px_rgba(255,255,255,0.1)] hover:shadow-none">
                  <span className="transform skew-x-12 inline-block uppercase tracking-widest">Login</span>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-6">
              <Link to="/cart" className="relative text-white">
                  <ShoppingCart size={24} />
                  {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-brand-accent w-2 h-2 rounded-full animate-pulse"></span>}
              </Link>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white hover:text-brand-accent transition-colors">
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-0 w-full bg-[#0a0a0b] border-b border-white/10 md:hidden z-40"
          >
            <div className="p-6 space-y-6">
               <form onSubmit={handleSearchSubmit}>
                 <input
                   type="text"
                   placeholder="BUSCAR..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full px-4 py-3 bg-[#16191e] border border-white/10 text-white font-mono text-sm uppercase focus:border-brand-accent outline-none"
                 />
               </form>
               <div className="flex flex-col space-y-4">
                {navLinks.map((item) => (
                  <button key={item.name} onClick={() => handleNavigation(item)} className="text-left font-black text-xl text-white uppercase tracking-tighter hover:text-brand-accent transition-colors">
                    {item.name}
                  </button>
                ))}
               </div>
               {isAuthenticated && (
                  <button onClick={() => {logout(); setIsMenuOpen(false);}} className="w-full text-left font-bold text-red-500 py-2 border-t border-white/10 pt-4 uppercase tracking-widest text-xs">
                    Cerrar Sesión
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