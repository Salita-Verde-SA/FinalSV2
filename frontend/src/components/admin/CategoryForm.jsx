import React, { useState, useEffect } from 'react';
import { X, Save, Loader, Tag, Edit, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CategoryForm = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { setName(initialData ? initialData.name : ''); setError(''); }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (!name.trim()) { setError('Nombre requerido'); return; }
    setLoading(true);
    try { await onSubmit({ name: name.trim() }); onClose(); } catch (err) { setError(err.message || 'Error'); } finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-md border-2 border-ui-border shadow-2xl">
          <div className="flex justify-between items-center p-5 bg-text-primary text-white">
            <h2 className="text-lg font-black italic uppercase flex items-center gap-2">
              {initialData ? <Edit size={18} className="text-primary"/> : <Plus size={18} className="text-primary"/>}
              {initialData ? 'Editar Categoría' : 'Nueva Categoría'}
            </h2>
            <button onClick={onClose}><X size={20}/></button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && <div className="bg-red-100 text-red-600 p-2 text-sm font-bold">{error}</div>}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-1 text-text-secondary">Nombre de la Serie</label>
              <div className="relative">
                 <Tag size={18} className="absolute left-3 top-3.5 text-gray-400"/>
                 <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 pl-10 border-2 border-ui-border outline-none focus:border-primary font-bold text-text-primary uppercase" placeholder="EJ: MTB ENDURO" autoFocus />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 font-bold uppercase text-xs text-text-secondary hover:text-black">Cancelar</button>
              <button type="submit" disabled={loading} className="px-6 py-2 bg-primary text-black font-black uppercase text-xs tracking-widest hover:bg-primary-hover shadow-md">
                {loading ? <Loader size={16} className="animate-spin"/> : 'Guardar'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CategoryForm;