// Ubicación: frontend/src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 text-center">
      <h1 className="text-[10rem] font-black leading-none text-gray-100 absolute z-0">404</h1>
      <div className="relative z-10">
        <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 text-black">Ruta fuera de catálogo</h2>
        <p className="text-gray-500 uppercase text-xs font-bold tracking-widest mb-10">La página que buscas no existe en UrbanStyle</p>
        <Link to="/" className="bg-black text-white px-10 py-4 font-bold uppercase text-xs tracking-widest hover:bg-gray-800 transition-all">
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
};

export default NotFound;