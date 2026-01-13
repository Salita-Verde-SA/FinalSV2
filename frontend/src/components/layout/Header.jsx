// Ubicación: frontend/src/components/layout/Header.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, Search, Shirt } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';

const Header = () => {
  const { cart } = useCartStore();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const { user, isAuthenticated, isAdmin } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleScrollTo = (id) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 h-20 flex items-center">
      <div className="max-w-7xl mx-auto px-4 w-full flex justify-between items-center">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
            <Shirt className="text-white" size={22} />
          </div>
          <span className="font-black text-2xl uppercase tracking-tighter">UrbanStyle</span>
        </Link>

        {/* NAVEGACIÓN PRINCIPAL */}
        <nav className="hidden md:flex space-x-8">
          <button onClick={() => handleScrollTo('inicio')} className="text-xs font-bold uppercase tracking-widest hover:text-gray-400">Inicio</button>
          <button onClick={() => handleScrollTo('productos')} className="text-xs font-bold uppercase tracking-widest hover:text-gray-400">Colecciones</button>
        </nav>

        {/* ICONOS */}
        <div className="flex items-center space-x-5">
          <Link to="/cart" className="relative p-2 hover:bg-gray-50 rounded-full transition-colors">
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <Link to="/profile" className="flex items-center gap-2 p-1 pr-3 hover:bg-gray-50 rounded-full border border-gray-100">
              <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Mi Perfil</span>
            </Link>
          ) : (
            <Link to="/login" className="p-2 hover:bg-gray-50 rounded-full">
              <User size={20} />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;