import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Loader, Phone, AlertCircle, User, Bike } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { clientService } from '../services/clientService';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.login);

  const [formData, setFormData] = useState({ email: '', name: '', lastname: '', telephone: '' });

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
    setError(''); setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      if (isLogin) {
        const client = await clientService.findByEmail(formData.email);
        if (!client) { setError('Email no registrado en el sistema'); return; }
        setAuth(client);
        if (client.email?.includes('admin')) { navigate('/admin'); } else { navigate('/'); }
      } else {
        const newClient = await clientService.create({ 
          email: formData.email, name: formData.name, lastname: formData.lastname, telephone: formData.telephone
        });
        setSuccess('¡Registro exitoso! Preparando acceso...');
        setTimeout(() => { setAuth(newClient); navigate('/'); }, 1500);
      }
    } catch (err) {
      console.error('Error:', err);
      let message = 'Error de conexión';
      if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData.detail === 'string') message = errorData.detail;
        else if (errorData.message) message = errorData.message;
      }
      setError(message);
    } finally { setLoading(false); }
  };

  const inputClass = "w-full pl-10 py-3 bg-white border-2 border-ui-border focus:border-primary focus:ring-0 text-text-primary placeholder-gray-400 font-medium outline-none transition-colors rounded-none";
  const iconClass = "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400";

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-surface py-12 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-topo-pattern opacity-5 pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="max-w-md w-full bg-white p-8 md:p-10 border border-ui-border shadow-xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-white mb-4 transform -skew-x-12 shadow-lg shadow-primary/30">
             <Bike size={32} className="transform skew-x-12"/>
          </div>
          <h2 className="text-3xl font-black text-text-primary uppercase italic tracking-tighter">
             Velo<span className="text-primary">Race</span> Access
          </h2>
          <p className="mt-2 text-sm font-bold text-text-secondary uppercase tracking-wide">
            {isLogin ? 'Acceso a Corredores' : 'Nuevo Registro'}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border-l-4 border-red-500 text-red-600 px-4 py-3 text-sm font-bold mb-6">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 bg-green-50 border-l-4 border-green-500 text-green-600 px-4 py-3 text-sm font-bold mb-6">
            <AlertCircle size={18} /> {success}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <div className={iconClass}><User size={18} /></div>
                <input name="name" required value={formData.name} onChange={handleChange} className={inputClass} placeholder="Nombre" />
              </div>
              <div className="relative">
                <div className={iconClass}><User size={18} /></div>
                <input name="lastname" required value={formData.lastname} onChange={handleChange} className={inputClass} placeholder="Apellido" />
              </div>
              <div className="relative col-span-2">
                <div className={iconClass}><Phone size={18} /></div>
                <input name="telephone" value={formData.telephone} onChange={handleChange} className={inputClass} placeholder="Teléfono" />
              </div>
            </div>
          )}
          
          <div className="relative">
            <div className={iconClass}><Mail size={18} /></div>
            <input name="email" type="email" required value={formData.email} onChange={handleChange} className={inputClass} placeholder="Email Institucional" />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full flex justify-center py-4 px-4 bg-text-primary hover:bg-primary text-white font-black uppercase tracking-widest transition-all hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            {loading ? <Loader className="animate-spin" /> : (isLogin ? 'Entrar a Pista' : 'Unirse al Equipo')}
          </button>
        </form>

        <div className="text-center mt-8 pt-6 border-t border-dashed border-ui-border">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }} 
            className="text-xs font-bold text-text-secondary hover:text-primary uppercase tracking-wider transition-colors"
          >
            {isLogin ? '¿Nuevo aquí? Crea tu ID' : '¿Ya tienes ID? Ingresa aquí'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;