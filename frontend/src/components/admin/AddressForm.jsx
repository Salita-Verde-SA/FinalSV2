import React, { useState, useEffect } from 'react';
import { X, Save, Loader, MapPin, Edit, Plus, Hash, Building } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AddressForm = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({ street: '', number: '', city: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setFormData(initialData ? { street: initialData.street, number: initialData.number, city: initialData.city } : { street: '', number: '', city: '' });
    setError('');
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (!formData.street.trim() || !formData.city.trim()) { setError('Calle y Ciudad obligatorias'); return; }
    setLoading(true);
    try { await onSubmit(formData); onClose(); } catch (err) { setError('Error guardando ruta'); } finally { setLoading(false); }
  };

  const inputClass = "w-full p-3 pl-10 border-2 border-ui-border outline-none focus:border-primary font-bold text-text-primary bg-surface uppercase";
  const labelClass = "block text-xs font-black uppercase tracking-wider mb-1 text-text-secondary";

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white w-full max-w-md border-2 border-ui-border shadow-2xl">
          <div className="flex justify-between items-center p-5 bg-text-primary text-white">
            <h2 className="text-lg font-black italic uppercase flex items-center gap-2">
              <MapPin size={18} className="text-primary"/> {initialData ? 'Ajustar Coordenadas' : 'Nuevo Punto de Entrega'}
            </h2>
            <button onClick={onClose}><X size={20}/></button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && <div className="bg-red-100 text-red-600 p-2 text-sm font-bold">{error}</div>}
            
            <div>
              <label className={labelClass}>Calle / Ruta</label>
              <div className="relative"><MapPin size={16} className="absolute left-3 top-4 text-gray-400"/><input required value={formData.street} onChange={(e) => setFormData({...formData, street: e.target.value})} className={inputClass} placeholder="AV. DEL LIBERTADOR" /></div>
            </div>
            <div>
              <label className={labelClass}>Altura / Km</label>
              <div className="relative"><Hash size={16} className="absolute left-3 top-4 text-gray-400"/><input value={formData.number} onChange={(e) => setFormData({...formData, number: e.target.value})} className={inputClass} placeholder="1234" /></div>
            </div>
            <div>
              <label className={labelClass}>Localidad</label>
              <div className="relative"><Building size={16} className="absolute left-3 top-4 text-gray-400"/><input required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className={inputClass} placeholder="BUENOS AIRES" /></div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-dashed border-ui-border mt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 font-bold uppercase text-xs text-text-secondary hover:text-black">Cancelar</button>
              <button type="submit" disabled={loading} className="px-6 py-2 bg-primary text-black font-black uppercase text-xs tracking-widest hover:bg-primary-hover shadow-md">
                {loading ? <Loader size={16} className="animate-spin"/> : 'Confirmar Ruta'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddressForm;