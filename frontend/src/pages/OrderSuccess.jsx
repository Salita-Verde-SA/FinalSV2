import React from 'react';
import { Link } from 'react-router-dom';

const OrderSuccess = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6">
      <div className="bg-green-100 text-green-600 w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-6">
        ✓
      </div>
      <h1 className="text-3xl font-bold mb-2">¡Pedido Recibido!</h1>
      <p className="text-gray-600 mb-8 max-w-sm">
        Tu orden ha sido procesada correctamente. Puedes seguir el estado desde tu perfil.
      </p>
      <div className="flex gap-4">
        <Link 
          to="/my-orders" 
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
        >
          Ver Mis Pedidos
        </Link>
        <Link 
          to="/" 
          className="border border-gray-300 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors"
        >
          Volver a Inicio
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;