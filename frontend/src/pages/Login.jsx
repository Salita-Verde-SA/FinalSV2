import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Loader, Phone, AlertCircle, User, Bike, ChevronRight, ShieldCheck } from 'lucide-react';
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
        setSuccess('REGISTRO COMPLETADO: ACCESO CONCEDIDO');
        setTimeout(() => { setAuth(newClient); navigate('/'); }, 1500);
      }
    } catch (err) {
      console.error('Error:', err);
      let message = 'Error de Conexión';
      if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData.detail === 'string') message = errorData.detail;
        else if (errorData.message) message = errorData.message;
      }
      // Traducimos errores comunes si es necesario
      if (message === 'User not found') message = 'Usuario no encontrado';
      setError(message.toUpperCase());
    } finally { setLoading(false); }
  };

  // Clases de estilo: Eliminé los guiones bajos en los placeholders y mantuve el estilo limpio
  const inputClass = "w-full pl-12 py-4 bg-white/5 border-b-2 border-white/10 focus:border-brand-accent focus:bg-white/[0.08] text-white placeholder-gray-500 font-mono text-sm outline-none transition-all uppercase tracking-widest";
  const iconClass = "absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30 group-focus-within:text-brand-accent transition-colors";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1115] py-12 px-4 relative overflow-hidden">
      {/* Decoración de fondo Tech */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-accent/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-500/5 blur-[120px]"></div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="max-w-md w-full bg-[#16191e] p-1 border border-white/10 shadow-[20px_20px_0px_rgba(0,0,0,0.3)] relative z-10"
      >
        <div className="bg-[#16191e] p-8 md:p-10 border border-white/5">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-accent text-black mb-6 transform -skew-x-12 shadow-[4px_4px_0px_#fff]">
               <Bike size={40} strokeWidth={2.5} className="transform skew-x-12"/>
            </div>
            <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
               VELORACE<span className="text-brand-accent not-italic font-light">/</span>ID
            </h2>
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="h-[1px] w-8 bg-white/10"></span>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
                {isLogin ? 'Conexión Segura' : 'Registro de Piloto'}
              </p>
              <span className="h-[1px] w-8 bg-white/10"></span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 bg-red-500/10 border-l-4 border-red-500 text-red-500 px-4 py-3 text-[10px] font-black mb-6 uppercase tracking-widest leading-tight">
                <AlertCircle size={16} /> {error}
              </motion.div>
            )}

            {success && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 bg-green-500/10 border-l-4 border-green-500 text-green-500 px-4 py-3 text-[10px] font-black mb-6 uppercase tracking-widest leading-tight">
                <ShieldCheck size={16} /> {success}
              </motion.div>
            )}
          </AnimatePresence>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative group">
                    <div className={iconClass}><User size={18} /></div>
                    <input name="name" required value={formData.name} onChange={handleChange} className={inputClass} placeholder="NOMBRE" />
                  </div>
                  <div className="relative group">
                    <div className={iconClass}><User size={18} /></div>
                    <input name="lastname" required value={formData.lastname} onChange={handleChange} className={inputClass} placeholder="APELLIDO" />
                  </div>
                </div>
                <div className="relative group">
                  <div className={iconClass}><Phone size={18} /></div>
                  <input name="telephone" value={formData.telephone} onChange={handleChange} className={inputClass} placeholder="TELÉFONO" />
                </div>
              </motion.div>
            )}
            
            <div className="relative group">
              <div className={iconClass}><Mail size={18} /></div>
              <input name="email" type="email" required value={formData.email} onChange={handleChange} className={inputClass} placeholder="CORREO ELECTRÓNICO" />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full flex items-center justify-center gap-3 py-5 px-4 bg-brand-accent text-black font-black uppercase italic tracking-[0.2em] transition-all transform hover:-translate-y-1 hover:bg-white shadow-[4px_4px_0px_rgba(255,255,255,0.2)] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <Loader className="animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Autorizar Acceso' : 'Confirmar Registro'}
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-10 pt-6 border-t border-white/5">
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }} 
              className="text-[10px] font-black text-white/30 hover:text-brand-accent uppercase tracking-[0.2em] transition-colors"
            >
              {isLogin ? '[ CREAR NUEVA CUENTA ]' : '[ VOLVER AL ACCESO ]'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Footer Branding */}
      <div className="absolute bottom-6 w-full text-center">
         <p className="text-[10px] font-mono text-white/10 tracking-[0.5em] uppercase">VeloRace Tech Labs // Mendoza</p>
      </div>
    </div>
  );
};

export default Login;