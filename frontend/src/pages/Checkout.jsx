import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, MapPin, Trash2, ShieldCheck, ArrowRight, Plus, Truck, Trophy } from 'lucide-react';
import { useCartStore } from '../store/useCartStore'; 
import { useAuthStore } from '../store/useAuthStore'; 
import { orderService } from '../services/orderService'; 
import { billService } from '../services/billService'; 
import { orderDetailService } from '../services/orderDetailService'; 
import { addressService } from '../services/addressService'; 

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getTotalPrice, clearCart } = useCartStore(); 
  const { user } = useAuthStore(); 
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('new');
  const [formData, setFormData] = useState({ street: '', number: '', city: '', cardNumber: '', expiry: '', cvv: '' });

  const subtotal = getTotalPrice();
  const shippingCost = subtotal > 500 ? 0 : 25;
  const finalTotal = subtotal + shippingCost;

  useEffect(() => {
    const fetchAddresses = async () => {
      if (user?.id_key) {
        try {
          const data = await addressService.getMyAddresses(user.id_key);
          setAddresses(data);
          if (data.length > 0) setSelectedAddressId(data[0].id_key);
        } catch (error) { console.error("Error cargando direcciones:", error); }
      }
    };
    fetchAddresses();
  }, [user]);

  const handleProcessOrder = async (e) => {
    e.preventDefault();
    if (!user?.id_key) return alert("Sesión inválida.");
    if (cart.length === 0) return alert("Carrito vacío.");
    
    setLoading(true);
    try {
      // (Lógica de negocio se mantiene idéntica, solo cambiamos visual)
      if (selectedAddressId === 'new') {
        await addressService.create({ street: formData.street, number: formData.number, city: formData.city, client_id: user.id_key });
      }
      const createdBill = await billService.create({
        bill_number: `FAC-${Date.now()}`, date: new Date().toISOString().split('T')[0], total: parseFloat(finalTotal), payment_type: 2, client_id: user.id_key, discount: 0
      });
      const createdOrder = await orderService.createOrder({
        total: parseFloat(finalTotal), delivery_method: 3, status: 1, client_id: user.id_key, bill_id: createdBill.id_key 
      });
      for (const item of cart) {
        await orderDetailService.create({
          order_id: createdOrder.id_key, product_id: item.id_key || item.id, quantity: item.quantity, price: item.price
        });
      }
      setShowSuccessModal(true);
      clearCart(); 
    } catch (error) { alert("Error en la transacción."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-gray-200 py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 border-b border-white/10 pb-6">
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">
            Finalizar <span className="text-brand-accent">Compra</span>
          </h1>
          <p className="text-gray-500 font-bold text-xs mt-2 uppercase tracking-[0.2em] flex items-center gap-2">
            <ShieldCheck size={14} className="text-brand-accent" /> Checkout Encriptado v2.0
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            {/* Sección Dirección */}
            <section className="bg-[#16191e] border border-white/5 p-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5"><Truck size={80}/></div>
               <h2 className="text-2xl font-black text-white uppercase italic mb-8">Punto de Entrega</h2>
               
               {addresses.length > 0 && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                   {addresses.map(addr => (
                     <div 
                       key={addr.id_key} 
                       onClick={() => setSelectedAddressId(addr.id_key)} 
                       className={`p-6 border cursor-pointer transition-all ${
                         selectedAddressId === addr.id_key ? 'border-brand-accent bg-brand-accent/5' : 'border-white/10 hover:border-white/30'
                       }`}
                     >
                       <p className="font-bold text-white uppercase text-sm mb-1">{addr.street} {addr.number}</p>
                       <p className="text-gray-500 text-xs uppercase font-mono">{addr.city}</p>
                     </div>
                   ))}
                   <button onClick={() => setSelectedAddressId('new')} className="p-6 border border-dashed border-white/20 flex flex-col items-center justify-center text-gray-500 hover:text-white hover:border-white transition-colors">
                     <Plus size={20} /><span className="text-[10px] font-black uppercase tracking-widest mt-2">Nueva Ruta</span>
                   </button>
                 </div>
               )}

               <AnimatePresence>
                 {(selectedAddressId === 'new' || addresses.length === 0) && (
                   <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                     <input type="text" placeholder="CALLE" className="bg-transparent border-b border-white/20 py-3 text-white placeholder-gray-600 focus:border-brand-accent outline-none uppercase font-bold text-sm transition-colors" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})}/>
                     <input type="text" placeholder="NÚMERO" className="bg-transparent border-b border-white/20 py-3 text-white placeholder-gray-600 focus:border-brand-accent outline-none uppercase font-bold text-sm transition-colors" value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})}/>
                     <input type="text" placeholder="CIUDAD / PROVINCIA" className="bg-transparent border-b border-white/20 py-3 text-white placeholder-gray-600 focus:border-brand-accent outline-none uppercase font-bold text-sm transition-colors md:col-span-2" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}/>
                   </motion.div>
                 )}
               </AnimatePresence>
            </section>

            {/* Sección Pago */}
            <section className="bg-[#16191e] border border-white/5 p-8">
               <h2 className="text-2xl font-black text-white uppercase italic mb-8">Datos de Pago</h2>
               <div className="space-y-6">
                 <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-[#0f1115] border border-white/10 p-4 text-white font-mono text-lg outline-none focus:border-brand-accent transition-colors placeholder-gray-700" maxLength={19} value={formData.cardNumber} onChange={e => setFormData({...formData, cardNumber: e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ')})}/>
                 <div className="grid grid-cols-2 gap-6">
                   <input type="text" placeholder="MM/AA" className="bg-[#0f1115] border border-white/10 p-4 text-white font-mono text-lg outline-none focus:border-brand-accent text-center placeholder-gray-700" maxLength={5} value={formData.expiry} onChange={e => {
                      let val = e.target.value.replace(/\D/g, '');
                      if (val.length > 2) val = val.substring(0,2) + '/' + val.substring(2,4);
                      setFormData({...formData, expiry: val})
                   }}/>
                   <input type="password" placeholder="CVV" className="bg-[#0f1115] border border-white/10 p-4 text-white font-mono text-lg outline-none focus:border-brand-accent text-center placeholder-gray-700" maxLength={4} value={formData.cvv} onChange={e => setFormData({...formData, cvv: e.target.value.replace(/\D/g, '')})}/>
                 </div>
               </div>
            </section>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-brand-accent p-1 sticky top-24">
               <div className="bg-[#16191e] p-8 h-full">
                  <h2 className="text-xl font-black text-white uppercase italic mb-6">Confirmación</h2>
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-xs font-bold uppercase text-gray-500 tracking-widest">
                      <span>Subtotal</span>
                      <span className="text-white font-mono">${subtotal.toLocaleString('es-AR')}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold uppercase text-gray-500 tracking-widest">
                      <span>Logística</span>
                      <span className="text-brand-accent font-black">{shippingCost === 0 ? 'BONIFICADO' : `$${shippingCost}`}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-end mb-8 pt-6 border-t border-white/10">
                    <span className="text-lg font-black text-white uppercase italic">Total</span>
                    <span className="text-4xl font-black text-brand-accent tracking-tighter leading-none">${finalTotal.toLocaleString('es-AR')}</span>
                  </div>
                  <button onClick={handleProcessOrder} disabled={loading} className="w-full bg-white hover:bg-gray-200 text-black py-5 font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                    {loading ? 'Procesando...' : 'Pagar Ahora'} <ArrowRight size={16} />
                  </button>
               </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/90 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#16191e] border-t-4 border-brand-accent p-12 max-w-md w-full text-center shadow-2xl">
              <div className="flex justify-center mb-8">
                <div className="w-24 h-24 bg-brand-accent/10 rounded-full flex items-center justify-center text-brand-accent animate-bounce">
                  <Trophy size={48} />
                </div>
              </div>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-4">¡Orden en Pista!</h2>
              <p className="text-gray-400 font-medium mb-10 text-sm">Tu equipo está confirmado y listo para el despacho.</p>
              <div className="space-y-4">
                <button onClick={() => navigate('/profile')} className="w-full bg-white text-black py-4 font-black uppercase tracking-widest text-xs hover:bg-brand-accent transition-colors">Ver Estado</button>
                <button onClick={() => navigate('/')} className="w-full bg-transparent text-gray-500 py-2 font-bold uppercase tracking-widest text-[10px] hover:text-white transition-colors">Volver al Inicio</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Checkout;