import React, { useState, useEffect } from 'react';
import { X, Save, Loader, Box, Tag, DollarSign, Layers, Plus, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProductForm = ({ isOpen, onClose, onSubmit, initialData = null, categories = [] }) => {
  const [formData, setFormData] = useState({ name: '', price: '', stock: '', category_id: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({ name: initialData.name || '', price: initialData.price || '', stock: initialData.stock || '', category_id: String(initialData.category_id || '') });
    } else {
      setFormData({ name: '', price: '', stock: '', category_id: categories.length > 0 ? String(categories[0].id) : '' });
    }
    setError('');
  }, [initialData, isOpen, categories]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const payload = { name: formData.name.trim(), price: parseFloat(formData.price), stock: parseInt(formData.stock), category_id: parseInt(formData.category_id) };
      if (!payload.name || payload.price <= 0 || payload.stock < 0 || !payload.category_id) throw new Error('Datos técnicos inválidos');
      await onSubmit(payload); onClose();
    } catch (err) { setError(err.message || 'Error de escritura'); } finally { setLoading(false); }
  };

  const inputClass = "w-full p-3 border-2 border-ui-border outline-none focus:border-primary font-bold text-text-primary bg-surface transition-colors";
  const labelClass = "block text-xs font-black uppercase tracking-wider mb-1 text-text-secondary";

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-2xl border-2 border-ui-border shadow-2xl">
          <div className="flex justify-between items-center p-5 bg-text-primary text-white border-b border-ui-border">
            <h2 className="text-xl font-black italic uppercase flex items-center gap-2">
              {initialData ? <Edit size={20} className="text-primary"/> : <Plus size={20} className="text-primary"/>}
              {initialData ? 'Modificar Especificaciones' : 'Nuevo Componente'}
            </h2>
            <button onClick={onClose}><X size={24}/></button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && <div className="bg-red-100 text-red-700 p-3 font-bold text-sm border-l-4 border-red-500">{error}</div>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className={labelClass}>Nombre del Componente</label>
                <div className="relative">
                   <Box size={18} className="absolute left-3 top-3.5 text-gray-400"/>
                   <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className={`${inputClass} pl-10`} placeholder="EJ: FRENO DISCO SHIMANO" />
                </div>
              </div>
              
              <div>
                <label className={labelClass}>Precio (USD)</label>
                <div className="relative">
                   <DollarSign size={18} className="absolute left-3 top-3.5 text-gray-400"/>
                   <input required type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className={`${inputClass} pl-10`} placeholder="0.00" />
                </div>
              </div>
              
              <div>
                <label className={labelClass}>Stock en Taller</label>
                <div className="relative">
                   <Layers size={18} className="absolute left-3 top-3.5 text-gray-400"/>
                   <input required type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} className={`${inputClass} pl-10`} placeholder="0" />
                </div>
              </div>
              
              <div className="col-span-2">
                <label className={labelClass}>Categoría Técnica</label>
                <div className="relative">
                   <Tag size={18} className="absolute left-3 top-3.5 text-gray-400"/>
                   <select required value={formData.category_id} onChange={(e) => setFormData({...formData, category_id: e.target.value})} className={`${inputClass} pl-10 appearance-none cursor-pointer`}>
                     <option value="">Seleccionar Categoría</option>
                     {categories.map(cat => <option key={cat.id} value={String(cat.id)}>{cat.name}</option>)}
                   </select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-6 border-t border-dashed border-ui-border">
              <button type="button" onClick={onClose} className="px-6 py-3 font-bold uppercase text-text-secondary hover:text-black hover:bg-gray-100 transition-colors">Cancelar</button>
              <button type="submit" disabled={loading} className="px-8 py-3 bg-primary text-black font-black uppercase tracking-widest hover:bg-primary-hover shadow-lg transition-transform transform hover:-translate-y-1 disabled:opacity-50">
                {loading ? <Loader className="animate-spin" /> : 'Guardar Ficha'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProductForm;