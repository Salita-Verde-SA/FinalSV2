import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, Save } from 'lucide-react';

const CategoryForm = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({ name: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) setFormData(initialData);
    else setFormData({ name: '' });
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      // El cierre lo maneja el padre tras el éxito, pero reseteamos aquí por si acaso
      setFormData({ name: '' }); 
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
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }} 
            className="w-full max-w-md bg-[#16191e] border-2 border-brand-accent shadow-[0_0_50px_rgba(255,77,0,0.1)] relative"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-[#0a0a0b]">
              <h2 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-2">
                <Tag size={20} className="text-brand-accent"/> {initialData ? 'EDITAR SERIE' : 'NUEVA CATEGORÍA'}
              </h2>
              <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-brand-accent tracking-widest block">Nombre de la Serie</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder="EJ: ENDURO PRO" 
                  className="w-full bg-[#0a0a0b] border border-white/10 p-4 text-white font-bold uppercase focus:border-brand-accent focus:outline-none transition-colors placeholder-gray-700"
                />
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end gap-4 pt-4">
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
                  className="bg-brand-accent text-black px-8 py-3 font-black uppercase tracking-widest hover:bg-white transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Procesando...' : <><Save size={16} /> Guardar</>}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CategoryForm;