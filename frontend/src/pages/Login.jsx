// Ubicación: frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Shirt, ArrowRight, UserPlus, LogIn } from 'lucide-react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true); // Estado para alternar vistas
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  
  const login = useAuthStore(state => state.login);
  const register = useAuthStore(state => state.register); // Asegúrate de que exista en tu store
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData);
      }
      navigate('/profile');
    } catch (err) {
      alert(isLogin ? "Error al ingresar. Revisa tus credenciales." : "Error al registrarse.");
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 pt-20 font-sans">
      <div className="max-w-md w-full">
        {/* LOGO */}
        <div className="mb-8 flex justify-center">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center shadow-2xl">
            <Shirt className="text-white" size={30} />
          </div>
        </div>

        {/* SELECTOR DE PESTAÑAS */}
        <div className="flex border-b border-gray-100 mb-10">
          <button 
            onClick={() => setIsLogin(true)}
            className={`flex-1 pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${isLogin ? 'border-b-2 border-black text-black' : 'text-gray-400'}`}
          >
            Ingresar
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            className={`flex-1 pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${!isLogin ? 'border-b-2 border-black text-black' : 'text-gray-400'}`}
          >
            Registrarse
          </button>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">
            {isLogin ? 'Bienvenido' : 'Nueva Cuenta'}
          </h2>
          <p className="text-gray-400 uppercase text-[10px] font-bold tracking-[0.3em]">
            {isLogin ? 'UrbanStyle Member Access' : 'Únete a la cultura urbana'}
          </p>
        </div>

        {/* FORMULARIO DINÁMICO */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input 
              name="name"
              type="text" 
              placeholder="NOMBRE COMPLETO" 
              className="w-full bg-gray-50 border-none px-6 py-4 text-xs font-bold tracking-widest outline-none focus:ring-1 focus:ring-black transition-all"
              onChange={handleInputChange}
              required
            />
          )}
          <input 
            name="email"
            type="email" 
            placeholder="EMAIL" 
            className="w-full bg-gray-50 border-none px-6 py-4 text-xs font-bold tracking-widest outline-none focus:ring-1 focus:ring-black transition-all"
            onChange={handleInputChange}
            required
          />
          <input 
            name="password"
            type="password" 
            placeholder="CONTRASEÑA" 
            className="w-full bg-gray-50 border-none px-6 py-4 text-xs font-bold tracking-widest outline-none focus:ring-1 focus:ring-black transition-all"
            onChange={handleInputChange}
            required
          />
          <button className="w-full bg-black text-white py-5 font-bold uppercase text-xs tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
            {isLogin ? <><LogIn size={16} /> Entrar</> : <><UserPlus size={16} /> Crear Cuenta</>}
          </button>
        </form>

        {/* PIE DE FORMULARIO */}
        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-[10px] text-gray-400 uppercase font-bold tracking-widest hover:text-black transition-colors"
          >
            {isLogin ? '¿Aún no tienes cuenta? Regístrate' : '¿Ya eres miembro? Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;