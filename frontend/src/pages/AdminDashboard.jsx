import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { Plus, Edit2, Trash2, Package, Tag, LayoutDashboard } from 'lucide-react';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('productos');

  useEffect(() => {
    const loadData = async () => {
      const [p, c] = await Promise.all([productService.getAll(), categoryService.getAll()]);
      setProducts(p);
      setCategories(c);
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
              <LayoutDashboard size={32} /> Panel de Control
            </h1>
            <p className="text-gray-500 text-xs uppercase font-bold tracking-widest mt-1">Gestión de inventario y colecciones</p>
          </div>
          <button className="bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-gray-800 transition-all">
            <Plus size={16} /> Nuevo Item
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 mb-8 border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('productos')}
            className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'productos' ? 'border-b-2 border-black text-black' : 'text-gray-400'}`}
          >
            <span className="flex items-center gap-2"><Package size={14} /> Productos ({products.length})</span>
          </button>
          <button 
            onClick={() => setActiveTab('categorias')}
            className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'categorias' ? 'border-b-2 border-black text-black' : 'text-gray-400'}`}
          >
            <span className="flex items-center gap-2"><Tag size={14} /> Categorías ({categories.length})</span>
          </button>
        </div>

        {/* Tabla de Productos */}
        <div className="bg-white shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 text-[10px] uppercase font-black tracking-widest">Producto</th>
                <th className="p-4 text-[10px] uppercase font-black tracking-widest">Categoría</th>
                <th className="p-4 text-[10px] uppercase font-black tracking-widest">Precio</th>
                <th className="p-4 text-[10px] uppercase font-black tracking-widest">Stock</th>
                <th className="p-4 text-[10px] uppercase font-black tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={p.image_url} alt="" className="w-10 h-10 object-cover bg-gray-100" />
                      <span className="text-xs font-bold uppercase">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs text-gray-500 uppercase">{categories.find(c => c.id === p.category_id)?.name || 'Sin categoría'}</td>
                  <td className="p-4 text-xs font-black">${p.price}</td>
                  <td className="p-4 text-xs font-medium">{p.stock} units</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-black transition-colors"><Edit2 size={14} /></button>
                      <button className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;