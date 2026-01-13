// Ubicación: frontend/src/pages/Profile.jsx
import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { User, LogOut, Package, MapPin } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-white pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-end mb-12 border-b border-black pb-6">
          <h1 className="text-3xl font-black uppercase tracking-tighter">Mi Cuenta</h1>
          <button onClick={logout} className="text-red-500 flex items-center gap-2 uppercase text-xs font-bold tracking-widest hover:opacity-70">
            <LogOut size={16} /> Salir
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-4">
            <div className="bg-gray-50 p-6 text-center">
              <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <h3 className="font-bold uppercase text-sm">{user?.name}</h3>
              <p className="text-gray-400 text-xs mt-1">{user?.email}</p>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="border border-gray-100 p-6 flex justify-between items-center group cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <Package className="text-gray-400" />
                <div>
                  <p className="font-bold uppercase text-xs tracking-widest">Mis Pedidos</p>
                  <p className="text-[10px] text-gray-400 uppercase mt-1">Ver historial de compras</p>
                </div>
              </div>
            </div>
            
            <div className="border border-gray-100 p-6 flex justify-between items-center group cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <MapPin className="text-gray-400" />
                <div>
                  <p className="font-bold uppercase text-xs tracking-widest">Direcciones</p>
                  <p className="text-[10px] text-gray-400 uppercase mt-1">Gestionar domicilios de entrega</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;