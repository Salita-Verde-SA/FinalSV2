import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, MapPin, Trash2, ShieldCheck, ArrowRight, Plus, Truck } from 'lucide-react';
import { useCartStore } from '../store/useCartStore'; 
import { useAuthStore } from '../store/useAuthStore'; 
import { orderService } from '../services/orderService'; //
import { billService } from '../services/billService'; //
import { orderDetailService } from '../services/orderDetailService'; //
import { addressService } from '../services/addressService'; //

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getTotalPrice, clearCart } = useCartStore(); 
  const { user } = useAuthStore(); 
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('new');
  const [formData, setFormData] = useState({ street: '', number: '', city: '', cardNumber: '', expiry: '', cvv: '' });

  // Lógica de Logística (Sincronizada con Cart.jsx)
  const subtotal = getTotalPrice();
  const shippingCost = subtotal > 500 ? 0 : 25;
  const finalTotal = subtotal + shippingCost;

  useEffect(() => {
    const fetchAddresses = async () => {
      if (user?.id_key) {
        try {
          const data = await addressService.getMyAddresses(user.id_key); //
          setAddresses(data);
          if (data.length > 0) setSelectedAddressId(data[0].id_key);
        } catch (error) { console.error("Error cargando direcciones:", error); }
      }
    };
    fetchAddresses();
  }, [user]);

  const handleDeleteAddress = async (e, addressId) => {
    e.stopPropagation();
    if (!window.confirm("¿Eliminar esta dirección?")) return;
    try {
      await addressService.delete(addressId); //
      setAddresses(addresses.filter(a => a.id_key !== addressId));
      if (selectedAddressId === addressId) setSelectedAddressId('new');
    } catch (error) { alert("Error al eliminar."); }
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); 
    const formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setFormData({ ...formData, cardNumber: formattedValue });
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) value = value.substring(0, 2) + '/' + value.substring(2, 4);
    setFormData({ ...formData, expiry: value });
  };

  const handleProcessOrder = async (e) => {
    e.preventDefault();
    if (!user?.id_key) return alert("Sesión inválida.");
    if (cart.length === 0) return alert("Carrito vacío.");
    if (selectedAddressId === 'new' && (!formData.street || !formData.city)) return alert("Completa la dirección.");
    if (formData.cardNumber.replace(/\s/g, '').length < 16) return alert("Tarjeta inválida.");

    setLoading(true);
    try {
      if (selectedAddressId === 'new') {
        await addressService.create({ street: formData.street, number: formData.number, city: formData.city, client_id: user.id_key }); //
      }

      // PASO 1: Crear Factura con el TOTAL FINAL (incluye logística)
      const createdBill = await billService.create({
        bill_number: `FAC-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        total: parseFloat(finalTotal), // Total con envío
        payment_type: 2, 
        client_id: user.id_key,
        discount: 0
      });

      // PASO 2: Crear Orden con el TOTAL FINAL (incluye logística)
      const createdOrder = await orderService.createOrder({
        total: parseFloat(finalTotal), // Total con envío
        delivery_method: 3, 
        status: 1, 
        client_id: user.id_key,
        bill_id: createdBill.id_key 
      });

      // PASO 3: Registrar detalles (estos mantienen el precio unitario original)
      for (const item of cart) {
        await orderDetailService.create({
          order_id: createdOrder.id_key,
          product_id: item.id_key || item.id, 
          quantity: item.quantity,
          price: item.price
        });
      }

      clearCart(); 
      navigate('/profile'); 
    } catch (error) { alert("Error en la transacción."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-surface py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 border-b-2 border-ui-border pb-6">
          <h1 className="text-5xl font-black text-text-primary italic uppercase tracking-tighter">Finalizar <span className="text-primary">Compra .</span></h1>
          <p className="text-text-secondary font-bold text-sm mt-2 uppercase tracking-widest flex items-center gap-2"><ShieldCheck size={16} className="text-primary" /> Checkout Race Ready</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            {/* SECCIÓN DIRECCIÓN */}
            <section className="bg-white border-2 border-ui-border p-8 relative">
               <h2 className="text-2xl font-black text-text-primary uppercase italic mb-6 flex items-center gap-3"><Truck className="text-primary" /> Punto de Entrega</h2>
               {addresses.length > 0 && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                   {addresses.map(addr => (
                     <div key={addr.id_key} onClick={() => setSelectedAddressId(addr.id_key)} className={`relative p-4 border-2 cursor-pointer transform -skew-x-2 transition-all ${selectedAddressId === addr.id_key ? 'border-primary bg-primary/5' : 'border-ui-border hover:border-text-primary'}`}>
                       <p className="font-bold text-text-primary uppercase text-sm">{addr.street} {addr.number}</p>
                       <p className="text-text-secondary text-xs uppercase">{addr.city}</p>
                       <button onClick={(e) => handleDeleteAddress(e, addr.id_key)} className="absolute top-2 right-2 text-ui-border hover:text-red-500"><Trash2 size={16} /></button>
                     </div>
                   ))}
                   <button onClick={() => setSelectedAddressId('new')} className={`p-4 border-2 border-dashed transform -skew-x-2 flex flex-col items-center justify-center transition-colors ${selectedAddressId === 'new' ? 'border-primary text-primary bg-primary/5' : 'border-ui-border text-text-muted hover:border-text-primary hover:text-text-primary'}`}>
                     <Plus size={20} /><span className="text-[10px] font-black uppercase tracking-widest">Nueva Dirección</span>
                   </button>
                 </div>
               )}
               <AnimatePresence>
                 {(selectedAddressId === 'new' || addresses.length === 0) && (
                   <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t-2 border-ui-border">
                     <input type="text" placeholder="CALLE" className="bg-surface border-2 border-ui-border p-3 text-sm outline-none focus:border-primary uppercase" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})}/>
                     <input type="text" placeholder="NÚMERO" className="bg-surface border-2 border-ui-border p-3 text-sm outline-none focus:border-primary uppercase" value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})}/>
                     <input type="text" placeholder="CIUDAD" className="bg-surface border-2 border-ui-border p-3 text-sm outline-none focus:border-primary uppercase md:col-span-2" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}/>
                   </motion.div>
                 )}
               </AnimatePresence>
            </section>

            {/* SECCIÓN PAGO */}
            <section className="bg-white border-2 border-ui-border p-8">
               <h2 className="text-2xl font-black text-text-primary uppercase italic mb-6 flex items-center gap-3"><CreditCard className="text-primary" /> Sistema de Pago</h2>
               <div className="bg-surface p-4 border-l-4 border-primary mb-6 text-[10px] font-black uppercase tracking-widest text-text-primary">Tarjeta de Débito Seleccionada</div>
               <div className="space-y-4">
                 <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-surface border-2 border-ui-border p-4 font-mono text-lg outline-none focus:border-primary tracking-widest" maxLength={19} value={formData.cardNumber} onChange={handleCardNumberChange}/>
                 <div className="grid grid-cols-2 gap-4">
                   <input type="text" placeholder="MM/AA" className="bg-surface border-2 border-ui-border p-4 font-mono text-lg outline-none focus:border-primary text-center" maxLength={5} value={formData.expiry} onChange={handleExpiryChange}/>
                   <input type="password" placeholder="CVV" className="bg-surface border-2 border-ui-border p-4 font-mono text-lg outline-none focus:border-primary text-center" maxLength={4} value={formData.cvv} onChange={e => setFormData({...formData, cvv: e.target.value.replace(/\D/g, '')})}/>
                 </div>
               </div>
            </section>
          </div>

          {/* RESUMEN ESTILO TICKET */}
          <div className="lg:col-span-1">
            <div className="bg-white border-2 border-text-primary p-6 sticky top-24 shadow-[8px_8px_0px_0px_rgba(255,51,51,0.1)]">
              <h2 className="text-xl font-black text-text-primary uppercase italic mb-6">Orden de Salida</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-[10px] font-black text-text-secondary uppercase">
                  <span>Subtotal</span>
                  <span className="font-mono">${subtotal.toLocaleString('es-AR')}</span>
                </div>
                <div className="flex justify-between text-[10px] font-black text-text-secondary uppercase">
                  <span>Logística</span>
                  {shippingCost === 0 ? (
                    <span className="text-primary font-black">GRATIS</span>
                  ) : (
                    <span className="font-mono">${shippingCost.toFixed(2)}</span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-end mb-8 pt-4 border-t-4 border-text-primary">
                <span className="text-lg font-black uppercase italic">Total Final</span>
                <span className="text-3xl font-black tracking-tighter">${finalTotal.toLocaleString('es-AR')}</span>
              </div>

              <button onClick={handleProcessOrder} disabled={loading} className="w-full bg-primary hover:bg-primary-hover text-white py-5 font-black uppercase tracking-widest text-sm transform -skew-x-12 transition-all active:scale-95 disabled:bg-ui-border flex items-center justify-center gap-3">
                <span className="transform skew-x-12 flex items-center gap-3">
                  {loading ? 'Procesando...' : 'Confirmar y Pagar'} <ArrowRight size={20}/>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;