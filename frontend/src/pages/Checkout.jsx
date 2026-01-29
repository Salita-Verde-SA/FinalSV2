import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, CreditCard, MapPin, Plus, Check, X, Calendar, Lock, Loader, AlertCircle, Bike } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { addressService } from '../services/addressService';
import { orderService } from '../services/orderService';
import AlertModal from '../components/ui/AlertModal';
import { motion } from 'framer-motion';

const Checkout = () => {
  const { cart, getTotalPrice, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const totalPrice = getTotalPrice();
  const shippingCost = totalPrice > 500 ? 0 : 25;
  const finalTotal = totalPrice + shippingCost;

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ street: '', number: '', city: '' });
  const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvc: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
    if (cart.length === 0 && !success) navigate('/');
  }, [isAuthenticated, cart, navigate, success]);

  useEffect(() => {
    if (isAuthenticated && user?.id_key) loadAddresses();
  }, [isAuthenticated, user]);

  const loadAddresses = async () => {
    try {
      const data = await addressService.getMyAddresses(user.id_key);
      const normalized = data.map(addr => ({ ...addr, id: addr.id || addr.id_key }));
      setAddresses(normalized);
      if (normalized.length > 0) { setSelectedAddressId(normalized[0].id); setIsAddingAddress(false); } 
      else { setIsAddingAddress(true); }
    } catch (error) { console.error("Error direcciones:", error); }
  };

  const handleSaveNewAddress = async () => {
    if (!newAddress.street || !newAddress.city) return showAlert('error', 'Faltan datos', 'Calle y Ciudad obligatorios.');
    setLoading(true);
    try {
      const saved = await addressService.create({ ...newAddress, client_id: user.id_key });
      await loadAddresses();
      setSelectedAddressId(saved.id || saved.id_key);
      setIsAddingAddress(false);
      setNewAddress({ street: '', number: '', city: '' });
    } catch (e) { showAlert('error', 'Error', 'No se pudo guardar la ruta.'); } 
    finally { setLoading(false); }
  };

  const showAlert = (type, title, message) => setAlertModal({ isOpen: true, type, title, message });

  const handlePayment = async () => {
    let finalAddr = selectedAddressId;
    setLoading(true);
    try {
       // Validaciones simplificadas para el ejemplo
       if (isAddingAddress) {
          const saved = await addressService.create({ ...newAddress, client_id: user.id_key });
          finalAddr = saved.id || saved.id_key;
       }
       if (!finalAddr) { setLoading(false); return showAlert('warning', 'Sin Ruta', 'Selecciona dirección.'); }
       
       await orderService.createOrder({
         client_id: user.id_key, total: finalTotal, status: "PENDING", payment_type: "CREDIT_CARD", address_id: finalAddr,
         details: cart.map(i => ({ product_id: i.id_key, quantity: i.quantity, price: i.price }))
       });
       clearCart(); setSuccess(true);
    } catch (e) { showAlert('error', 'Fallo Mecánico', 'Error al procesar el pedido.'); } 
    finally { setLoading(false); }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-surface text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center mb-6 shadow-xl">
          <Bike size={48} />
        </motion.div>
        <h2 className="text-4xl font-black italic text-text-primary uppercase mb-2">¡Salida Confirmada!</h2>
        <p className="text-text-secondary font-medium mb-8">Tu equipo está en preparación.</p>
        <button onClick={() => navigate('/')} className="bg-black text-white px-8 py-3 font-bold uppercase tracking-widest hover:bg-primary transition-colors">Volver a Pista</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6"><Link to="/cart" className="text-xs font-bold uppercase text-text-secondary hover:text-primary flex items-center gap-2"><ArrowLeft size={14}/> Volver al Garage</Link></div>
        <h1 className="text-4xl font-black text-text-primary uppercase italic mb-8 border-b-4 border-primary inline-block">Confirmar Pedido</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* DIRECCION */}
            <div className="bg-white border-2 border-ui-border p-6">
              <div className="flex justify-between items-center mb-6 border-b-2 border-dashed border-ui-border pb-2">
                 <h3 className="font-bold uppercase flex items-center gap-2"><MapPin className="text-primary"/> Punto de Entrega</h3>
                 {!isAddingAddress && <button onClick={() => {setIsAddingAddress(true); setSelectedAddressId(null);}} className="text-xs font-bold text-primary hover:underline">Nueva Ruta</button>}
              </div>
              
              {!isAddingAddress && addresses.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map(addr => (
                    <div key={addr.id} onClick={() => setSelectedAddressId(addr.id)} className={`p-4 border-2 cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-primary bg-orange-50' : 'border-ui-border hover:border-gray-400'}`}>
                       <div className="font-bold text-text-primary uppercase text-sm">{addr.street} {addr.number}</div>
                       <div className="text-xs text-text-secondary font-mono">{addr.city}</div>
                    </div>
                  ))}
                </div>
              )}

              {(isAddingAddress || addresses.length === 0) && (
                <div className="bg-surface p-4 border border-ui-border">
                   <div className="grid grid-cols-2 gap-4">
                      <input name="street" value={newAddress.street} onChange={(e) => setNewAddress({...newAddress, [e.target.name]: e.target.value})} placeholder="CALLE" className="col-span-2 p-2 border border-ui-border font-bold text-sm outline-none focus:border-primary"/>
                      <input name="number" value={newAddress.number} onChange={(e) => setNewAddress({...newAddress, [e.target.name]: e.target.value})} placeholder="ALTURA" className="p-2 border border-ui-border font-bold text-sm outline-none focus:border-primary"/>
                      <input name="city" value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, [e.target.name]: e.target.value})} placeholder="CIUDAD" className="p-2 border border-ui-border font-bold text-sm outline-none focus:border-primary"/>
                   </div>
                   <div className="mt-4 text-right">
                      {addresses.length > 0 && <button onClick={() => setIsAddingAddress(false)} className="mr-4 text-xs font-bold uppercase">Cancelar</button>}
                      <button onClick={handleSaveNewAddress} className="bg-black text-white px-4 py-2 text-xs font-bold uppercase hover:bg-primary">Guardar</button>
                   </div>
                </div>
              )}
            </div>

            {/* PAGO */}
            <div className="bg-white border-2 border-ui-border p-6">
              <h3 className="font-bold uppercase flex items-center gap-2 mb-6 border-b-2 border-dashed border-ui-border pb-2"><CreditCard className="text-primary"/> Pago Seguro</h3>
              <div className="space-y-4">
                 <input placeholder="NUMERO DE TARJETA" className="w-full p-3 border-2 border-ui-border font-mono text-sm outline-none focus:border-primary bg-surface"/>
                 <div className="grid grid-cols-2 gap-4">
                    <input placeholder="MM/AA" className="p-3 border-2 border-ui-border font-mono text-sm outline-none focus:border-primary bg-surface"/>
                    <input placeholder="CVC" className="p-3 border-2 border-ui-border font-mono text-sm outline-none focus:border-primary bg-surface"/>
                 </div>
                 <input placeholder="TITULAR" className="w-full p-3 border-2 border-ui-border font-bold text-sm outline-none focus:border-primary bg-surface"/>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
             <div className="bg-text-primary text-white p-6 sticky top-24 shadow-2xl">
                <h2 className="font-black italic uppercase text-xl mb-6 border-b border-gray-700 pb-4">Resumen</h2>
                <div className="space-y-2 mb-6 text-sm text-gray-400">
                   <div className="flex justify-between"><span>Subtotal</span> <span className="text-white font-mono">${totalPrice}</span></div>
                   <div className="flex justify-between"><span>Envío</span> <span className="text-primary font-bold">{shippingCost === 0 ? 'FREE' : `$${shippingCost}`}</span></div>
                </div>
                <div className="flex justify-between items-end mb-8 pt-4 border-t border-gray-700">
                   <span className="font-bold uppercase">Total</span>
                   <span className="text-3xl font-black italic text-primary">${finalTotal}</span>
                </div>
                <button onClick={handlePayment} disabled={loading} className="w-full bg-primary hover:bg-white hover:text-black text-black font-black uppercase tracking-widest py-4 transition-colors disabled:opacity-50">
                   {loading ? 'Procesando...' : 'Confirmar Pedido'}
                </button>
             </div>
          </div>
        </div>
      </div>
      <AlertModal isOpen={alertModal.isOpen} onClose={() => setAlertModal({...alertModal, isOpen: false})} title={alertModal.title} message={alertModal.message} type={alertModal.type} />
    </div>
  );
};

export default Checkout;