import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { orderService } from '../services/orderService';
import { addressService } from '../services/addressService';
import { billService } from '../services/billService';
import { clientService } from '../services/clientService';
import { LogOut, Trash2, Plus, FileText, Edit2, Save, X, Bike, Calendar, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AddressForm from '../components/admin/AddressForm';
import ConfirmModal from '../components/ui/ConfirmModal';
import AlertModal from '../components/ui/AlertModal';

const Profile = () => {
  const { user, logout, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', lastname: '', email: '', telephone: '' });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  const showAlert = (type, title, message) => setAlertModal({ isOpen: true, type, title, message });
  
  // Helper para mostrar el estado como texto legible
  const getStatusText = (status) => {
    switch (status) {
      case 1:
      case '1':
        return 'PENDIENTE';
      case 2:
      case '2':
        return 'EN PROGRESO';
      case 3:
      case '3':
        return 'ENTREGADO';
      case 4:
      case '4':
        return 'CANCELADO';
      default:
        return String(status);
    }
  };
  
  const fieldLabels = {
    name: 'Nombre',
    lastname: 'Apellido',
    email: 'Email de Contacto',
    telephone: 'Teléfono / Móvil'
  };

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true); setError('');
      try {
        if (activeTab === 'orders') {
          const data = await orderService.getMyOrders(user.id_key);
          if (isMounted) setOrders(data);
        } else if (activeTab === 'addresses') {
          const data = await addressService.getMyAddresses(user.id_key);
          if (isMounted) setAddresses(data.map(addr => ({ ...addr, id: addr.id || addr.id_key })));
        } else if (activeTab === 'bills') {
          const data = await billService.getMyBills(user.id_key);
          if (isMounted) setBills(data);
        }
      } catch (err) {
        if (isMounted) setError('Error de sincronización con el servidor.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    // Verificamos user?.id_key antes de disparar el efecto
    if (user?.id_key) fetchData();
    return () => { isMounted = false; };
  }, [activeTab, user?.id_key]);

  useEffect(() => {
    if (user) setEditForm({ 
      name: user.name || '', lastname: user.lastname || '', email: user.email || '', telephone: user.telephone || '' 
    });
  }, [user]);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleEditToggle = () => {
    if (isEditing) setEditForm({ name: user.name || '', lastname: user.lastname || '', email: user.email || '', telephone: user.telephone || '' });
    setIsEditing(!isEditing);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim() || !editForm.lastname.trim()) return showAlert('warning', 'Incompleto', 'Nombre y Apellido requeridos.'); 
    setUpdatingProfile(true);
    try {
      const updatedData = await clientService.update(user.id_key, editForm);
      updateUser({ ...user, ...updatedData });
      setIsEditing(false);
      showAlert('success', 'Actualizado', 'Datos de licencia renovados.');
    } catch (err) { showAlert('error', 'Error', 'Fallo al actualizar.'); } 
    finally { setUpdatingProfile(false); }
  };

  const handleDeleteAddress = (address) => {
    setConfirmModal({
      isOpen: true,
      title: '¿Eliminar Ruta?',
      message: `Se borrará "${address.street}".`,
      onConfirm: async () => {
        setConfirmLoading(true);
        try {
          await addressService.delete(address.id || address.id_key);
          setAddresses(p => p.filter(a => (a.id || a.id_key) !== (address.id || address.id_key)));
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (err) { showAlert('error', 'Error', 'No se pudo eliminar.'); } 
        finally { setConfirmLoading(false); }
      }
    });
  };

  const handleAddressSubmit = async (data) => {
    try {
      const newAddr = await addressService.create({ ...data, client_id: user.id_key });
      setAddresses([...addresses, { ...newAddr, id: newAddr.id || newAddr.id_key }]);
      setIsAddressModalOpen(false);
    } catch (err) { throw new Error('Error al crear ruta'); }
  };

  // Helper seguro para fechas
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Fecha desconocida';
    try {
        return new Date(dateStr).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
        return dateStr;
    }
  };

  // Helper seguro para IDs
  const getSafeId = (id) => {
      if (typeof id === 'string') return id.substring(0, 8);
      return id || '---';
  };

  // Helper para iniciales
  const getInitials = (name) => {
      if (!name) return '?';
      return name.charAt(0);
  }

  return (
    <div className="min-h-screen bg-[#0f1115] pt-24 pb-12 px-4 text-gray-200">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Perfil */}
        <div className="bg-[#16191e] border border-white/10 p-8 mb-10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="w-24 h-24 bg-brand-accent text-black flex items-center justify-center font-black text-3xl shrink-0">
            {getInitials(user?.name)}
          </div>
          <div className="flex-grow text-center md:text-left z-10">
            <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter">{user?.name || 'Piloto'} {user?.lastname || ''}</h1>
            {/* CORRECCIÓN PRINCIPAL AQUÍ: Usamos getSafeId */}
            <p className="text-gray-500 font-mono text-xs mt-1 uppercase tracking-widest">LICENCIA ID: {getSafeId(user?.id_key)}</p>
            <span className="mt-3 inline-block px-3 py-1 border border-white/20 text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
              {user?.role === 'admin' ? 'Team Manager' : 'Pro Rider'}
            </span>
          </div>
          <button onClick={handleLogout} className="text-[10px] font-bold text-red-500 uppercase tracking-[0.2em] hover:text-white transition-colors flex items-center gap-2 border border-red-500/20 px-4 py-2 hover:bg-red-500 hover:border-red-500">
            <LogOut size={14} /> Desconectar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 flex flex-col gap-1">
            {['orders', 'bills', 'addresses', 'info'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)} 
                className={`w-full text-left px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-l-2 ${
                  activeTab === tab ? 'bg-white/5 border-brand-accent text-white' : 'border-transparent text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab === 'orders' ? 'Historial' : tab === 'bills' ? 'Facturación' : tab === 'addresses' ? 'Rutas' : 'Licencia'}
              </button>
            ))}
          </div>

          <div className="md:col-span-3 min-h-[400px]">
            {loading ? (
              <div className="flex justify-center py-20 opacity-50"><Bike className="animate-bounce text-brand-accent"/></div>
            ) : (
              <AnimatePresence mode="wait">
                {activeTab === 'orders' && (
                  <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <h2 className="text-xl font-black text-white uppercase italic mb-6">Historial de Carrera</h2>
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id_key || order.id} className="bg-[#16191e] border border-white/5 p-6 hover:border-brand-accent/50 transition-colors group">
                           <div className="flex justify-between mb-4 items-start">
                             <div>
                               <span className="text-[10px] font-mono text-brand-accent mb-1 block">OP #{getSafeId(order.id_key || order.id)}</span>
                               <p className="text-sm font-bold text-white flex items-center gap-2">
                                 <Calendar size={14} className="text-gray-500"/> {formatDate(order.date)}
                               </p>
                             </div>
                             <span className="text-[9px] font-black uppercase px-2 py-1 bg-white/5 border border-white/10 text-white/60">
                               {getStatusText(order.status)}
                             </span>
                           </div>
                           <div className="text-xs text-gray-500 border-t border-white/5 pt-3 mt-3 space-y-1 font-mono uppercase">
                             {order.details?.map((item, i) => (
                               <div key={i} className="flex justify-between">
                                 <span>{item.quantity}x {item.product_name}</span>
                               </div>
                             ))}
                           </div>
                           <div className="mt-4 text-right font-black text-xl text-white tracking-tighter">
                             ${order.total?.toFixed(2)}
                           </div>
                        </div>
                      ))}
                      {orders.length === 0 && <div className="text-center py-16 border border-dashed border-white/10 text-gray-600 font-mono text-xs uppercase">Sin registros en pista</div>}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'bills' && (
                  <motion.div key="bills" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h2 className="text-xl font-black text-white uppercase italic mb-6">Comprobantes</h2>
                    <div className="space-y-2">
                      {bills.map((bill) => (
                        <div key={bill.id_key} className="bg-[#16191e] border border-white/5 p-4 flex justify-between items-center hover:bg-white/5 transition-colors cursor-default">
                          <div className="flex items-center gap-4">
                            <FileText className="text-brand-accent" size={20} />
                            <div>
                              <p className="font-bold text-white text-sm uppercase">Factura {bill.bill_number}</p>
                              <p className="text-[10px] text-gray-500 font-mono">{formatDate(bill.created_at)}</p>
                            </div>
                          </div>
                          <p className="font-mono font-bold text-white">${bill.total_amount?.toFixed(2)}</p>
                        </div>
                      ))}
                      {bills.length === 0 && <div className="text-center py-16 border border-dashed border-white/10 text-gray-600 font-mono text-xs uppercase">Sin facturas emitidas</div>}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'addresses' && (
                  <motion.div key="addresses" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-black text-white uppercase italic">Puntos de Entrega</h2>
                      <button onClick={() => setIsAddressModalOpen(true)} className="bg-brand-accent text-black p-2 hover:bg-white transition-colors"><Plus size={20}/></button>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {addresses.map(addr => (
                        <div key={addr.id} className="bg-[#16191e] p-6 border border-white/5 relative group hover:border-white/20 transition-all">
                          <div className="flex items-start gap-4">
                            <MapPin className="text-brand-accent shrink-0" size={20} />
                            <div>
                              <p className="font-bold text-white uppercase text-sm">{addr.street} {addr.number}</p>
                              <p className="text-xs text-gray-500 font-mono uppercase mt-1">{addr.city}, {addr.state}</p>
                            </div>
                          </div>
                          <button onClick={() => handleDeleteAddress(addr)} className="absolute top-4 right-4 text-gray-600 hover:text-red-500 transition-colors">
                            <Trash2 size={16}/>
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'info' && (
                   <motion.div key="info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#16191e] p-8 border border-white/5">
                      <div className="flex justify-between mb-8 pb-4 border-b border-white/5">
                        <h2 className="text-xl font-black text-white uppercase italic">Datos de Licencia</h2>
                        <button onClick={handleEditToggle} className="flex items-center gap-2 text-[10px] font-black uppercase text-brand-accent hover:text-white transition-colors tracking-widest">
                          {isEditing ? <><X size={14}/> Cancelar</> : <><Edit2 size={14}/> Editar</>}
                        </button>
                      </div>
                      <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                         {Object.keys(fieldLabels).map((field) => (
                           <div key={field}>
                             <label className="text-[10px] font-black text-gray-500 uppercase mb-2 block tracking-widest">{fieldLabels[field]}</label>
                             <input 
                               name={field} 
                               value={isEditing ? editForm[field] : (user?.[field] || '')} 
                               onChange={(e) => setEditForm({...editForm, [e.target.name]: e.target.value})}
                               disabled={!isEditing || updatingProfile}
                               className={`w-full p-3 bg-transparent border-b outline-none font-bold text-white transition-all ${
                                 isEditing ? 'border-brand-accent text-brand-accent' : 'border-white/10 text-gray-400 cursor-not-allowed'
                               }`}
                             />
                           </div>
                         ))}
                         {isEditing && (
                           <button type="submit" disabled={updatingProfile} className="col-span-full mt-6 bg-white text-black py-4 font-black uppercase tracking-widest hover:bg-brand-accent transition-all flex items-center justify-center gap-2">
                             {updatingProfile ? 'Sincronizando...' : <><Save size={18}/> Guardar Cambios</>}
                           </button>
                         )}
                      </form>
                   </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>

        <AddressForm isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} onSubmit={handleAddressSubmit} />
        <ConfirmModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal(p => ({...p, isOpen: false}))} onConfirm={confirmModal.onConfirm} title={confirmModal.title} message={confirmModal.message} type="danger" loading={confirmLoading} />
        <AlertModal isOpen={alertModal.isOpen} onClose={() => setAlertModal(p => ({...p, isOpen: false}))} title={alertModal.title} message={alertModal.message} type={alertModal.type} />
      </div>
    </div>
  );
};

export default Profile;