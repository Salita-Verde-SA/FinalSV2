import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Box, Save, DollarSign, Layers } from 'lucide-react';

const ProductForm = ({ isOpen, onClose, onSubmit, initialData, categories }) => {
  const [formData, setFormData] = useState({ name: '', price: '', stock: '', category_id: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        price: initialData.price,
        stock: initialData.stock,
        category_id: initialData.category_id
      });
    } else {
      setFormData({ name: '', price: '', stock: '', category_id: '' });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Aseguramos tipos de datos correctos para el backend
      await onSubmit({
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category_id: parseInt(formData.category_id)
      });
      // No reseteamos aquí para evitar parpadeos si hay error, el padre cierra el modal
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 20 }} 
            className="w-full max-w-2xl bg-[#16191e] border border-white/10 shadow-2xl"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-[#0a0a0b]">
              <h2 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-2">
                <Box size={20} className="text-brand-accent"/> {initialData ? 'RECONFIGURAR COMPONENTE' : 'NUEVO COMPONENTE'}
              </h2>
              <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Nombre */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block">Nombre del Componente</label>
                <input 
                  required 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder="EJ: FRENO DISCO SHIMANO" 
                  className="w-full bg-[#0a0a0b] border border-white/10 p-4 text-white font-bold uppercase focus:border-brand-accent focus:outline-none placeholder-gray-700"
                />
              </div>

              {/* Precio */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block">Precio (USD)</label>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-accent"/>
                  <input 
                    type="number" 
                    required 
                    min="0"
                    step="0.01"
                    value={formData.price} 
                    onChange={(e) => setFormData({...formData, price: e.target.value})} 
                    className="w-full bg-[#0a0a0b] border border-white/10 p-4 pl-10 text-white font-mono font-bold focus:border-brand-accent focus:outline-none"
                  />
                </div>
              </div>

              {/* Stock */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block">Stock en Taller</label>
                <div className="relative">
                  <Layers size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"/>
                  <input 
                    type="number" 
                    required 
                    min="0"
                    value={formData.stock} 
                    onChange={(e) => setFormData({...formData, stock: e.target.value})} 
                    className="w-full bg-[#0a0a0b] border border-white/10 p-4 pl-10 text-white font-mono font-bold focus:border-brand-accent focus:outline-none"
                  />
                </div>
              </div>

              {/* Categoría */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block">Categoría Técnica</label>
                <select 
                  required 
                  value={formData.category_id} 
                  onChange={(e) => setFormData({...formData, category_id: e.target.value})} 
                  className="w-full bg-[#0a0a0b] border border-white/10 p-4 text-white font-bold uppercase focus:border-brand-accent focus:outline-none appearance-none"
                >
                  <option value="">SELECCIONAR SERIE...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="md:col-span-2 flex justify-end gap-4 pt-6 border-t border-white/5 mt-4">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="px-6 py-3 text-[10px] font-bold uppercase text-gray-500 hover:text-white transition-colors tracking-widest"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="bg-brand-accent text-black px-8 py-3 font-black uppercase tracking-widest hover:bg-white transition-colors shadow-glow flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : <><Save size={16}/> Guardar Ficha</>}
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProductForm;