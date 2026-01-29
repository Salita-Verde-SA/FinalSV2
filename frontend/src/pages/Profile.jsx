import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { orderService } from '../services/orderService';
import { addressService } from '../services/addressService';
import { billService } from '../services/billService';
import { clientService } from '../services/clientService';
import { User, Package, MapPin, LogOut, Clock, CheckCircle, Truck, Trash2, Plus, FileText, AlertCircle, Edit2, Save, X, Bike } from 'lucide-react';
import { motion } from 'framer-motion';
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); setError('');
      try {
        if (activeTab === 'orders') setOrders(await orderService.getMyOrders(user.id_key));
        else if (activeTab === 'addresses') {
          const data = await addressService.getMyAddresses(user.id_key);
          setAddresses(data.map(addr => ({ ...addr, id: addr.id || addr.id_key })));
        } else if (activeTab === 'bills') setBills(await billService.getMyBills(user.id_key));
      } catch (err) { console.error(err); setError('Error de sincronización de datos.'); } 
      finally { setLoading(false); }
    };
    if (user?.id_key) fetchData();
  }, [activeTab, user?.id_key]);

  useEffect(() => {
    if (user) setEditForm({ name: user.name || '', lastname: user.lastname || '', email: user.email || '', telephone: user.telephone || '' });
  }, [user]);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleEditToggle = () => {
    if (isEditing) setEditForm({ name: user.name || '', lastname: user.lastname || '', email: user.email || '', telephone: user.telephone || '' });
    setIsEditing(!isEditing);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim() || !editForm.lastname.trim() || !editForm.email.trim()) { showAlert('warning', 'Datos incompletos', 'Nombre y Email requeridos.'); return; }
    setUpdatingProfile(true);
    try {
      const updatedData = await clientService.update(user.id_key, { name: editForm.name, lastname: editForm.lastname, email: editForm.email, telephone: editForm.telephone });
      updateUser({ ...user, ...updatedData });
      setIsEditing(false);
      showAlert('success', 'Actualizado', 'Licencia actualizada correctamente.');
    } catch (err) { showAlert('error', 'Error', 'Fallo al actualizar datos.'); } 
    finally { setUpdatingProfile(false); }
  };

  const handleDeleteAddress = (address) => {
    setConfirmModal({
      isOpen: true,
      title: '¿Eliminar Ruta?',
      message: `Se eliminará "${address.street}".`,
      onConfirm: async () => {
        setConfirmLoading(true);
        try {
          await addressService.delete(address.id || address.id_key);
          setAddresses(p => p.filter(a => (a.id || a.id_key) !== (address.id || address.id_key)));
          setConfirmModal({ ...confirmModal, isOpen: false });
        } catch (err) { showAlert('error', 'Error', 'No se pudo eliminar.'); setConfirmModal({ ...confirmModal, isOpen: false }); } 
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

  const tabClass = (tab) => `w-full text-left px-4 py-3 text-sm font-bold uppercase tracking-wider border-l-4 transition-all ${activeTab === tab ? 'border-primary bg-white text-primary' : 'border-transparent text-text-secondary hover:bg-white hover:text-text-primary'}`;

  return (
    <div className="min-h-screen bg-surface pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white border-2 border-ui-border p-6 mb-8 flex flex-col md:flex-row items-center gap-6 shadow-sm">
          <div className="w-20 h-20 bg-text-primary text-white flex items-center justify-center font-black text-2xl transform -skew-x-12">
            <span className="transform skew-x-12">{user?.name?.charAt(0)}</span>
          </div>
          <div className="flex-grow text-center md:text-left">
            <h1 className="text-3xl font-black italic text-text-primary uppercase">{user?.name} {user?.lastname}</h1>
            <p className="text-text-secondary font-medium tracking-wide">Rider ID: {user?.id}</p>
            <div className="mt-2 inline-block px-2 py-0.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest">
              {user?.role === 'admin' ? 'Team Manager' : 'Pro Rider'}
            </div>
          </div>
          <button onClick={handleLogout} className="text-xs font-bold text-red-500 uppercase tracking-widest hover:underline flex items-center gap-2">
            <LogOut size={16} /> Salir
          </button>
        </div>

        {error && <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-sm text-red-700 font-bold">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-1">
            <button onClick={() => setActiveTab('orders')} className={tabClass('orders')}>Mis Pedidos</button>
            <button onClick={() => setActiveTab('bills')} className={tabClass('bills')}>Facturación</button>
            <button onClick={() => setActiveTab('addresses')} className={tabClass('addresses')}>Rutas de Envío</button>
            <button onClick={() => setActiveTab('info')} className={tabClass('info')}>Datos Licencia</button>
          </div>

          <div className="md:col-span-3">
            {loading ? <div className="text-center py-10 font-bold text-text-muted italic">CARGANDO DATOS...</div> : (
              <>
                {activeTab === 'orders' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h2 className="text-xl font-black text-text-primary uppercase italic mb-6 border-b-2 border-ui-border pb-2">Historial de Equipo</h2>
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="bg-white border border-ui-border p-5 hover:border-l-4 hover:border-l-primary transition-all">
                           <div className="flex justify-between mb-4">
                             <div>
                               <span className="text-xs font-black text-primary uppercase">ORDEN #{order.id}</span>
                               <p className="text-sm font-bold text-text-primary">{order.date}</p>
                             </div>
                             <span className="text-xs font-bold uppercase px-2 py-1 bg-surface border border-ui-border h-fit">{order.status}</span>
                           </div>
                           <div className="text-sm text-text-secondary border-t border-dashed border-ui-border pt-2 mt-2">
                             {order.details?.map((d, i) => <div key={i}>{d.quantity}x <span className="font-bold">{d.product_name || `Item ${d.product_id}`}</span></div>)}
                           </div>
                           <div className="mt-3 text-right font-black text-lg text-text-primary">${order.total?.toFixed(2)}</div>
                        </div>
                      ))}
                      {orders.length === 0 && <div className="text-center py-10 border-2 border-dashed border-ui-border opacity-50 font-bold">SIN ACTIVIDAD RECIENTE</div>}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'addresses' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="flex justify-between items-center mb-6 border-b-2 border-ui-border pb-2">
                      <h2 className="text-xl font-black text-text-primary uppercase italic">Puntos de Entrega</h2>
                      <button onClick={() => setIsAddressModalOpen(true)} className="bg-primary text-white p-2 hover:bg-black transition-colors"><Plus size={20}/></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map(addr => (
                        <div key={addr.id || addr.id_key} className="bg-white p-5 border border-ui-border relative group">
                          <div className="flex items-start gap-3">
                            <MapPin className="text-primary" size={20} />
                            <div>
                              <p className="font-bold text-text-primary uppercase text-sm">{addr.street} {addr.number}</p>
                              <p className="text-xs text-text-secondary font-mono">{addr.city}</p>
                            </div>
                          </div>
                          <button onClick={() => handleDeleteAddress(addr)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'info' && (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-6 border border-ui-border">
                      <div className="flex justify-between mb-6 border-b-2 border-ui-border pb-2">
                        <h2 className="text-xl font-black text-text-primary uppercase italic">Datos de Licencia</h2>
                        <button onClick={handleEditToggle} className="text-xs font-bold uppercase text-primary hover:underline">{isEditing ? 'Cancelar' : 'Editar'}</button>
                      </div>
                      <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {['name', 'lastname', 'email', 'telephone'].map((field) => (
                           <div key={field}>
                             <label className="text-xs font-bold text-text-secondary uppercase mb-1 block">{field}</label>
                             <input 
                               name={field} 
                               value={isEditing ? editForm[field] : (user?.[field] || '')} 
                               onChange={(e) => setEditForm({...editForm, [e.target.name]: e.target.value})}
                               disabled={!isEditing || updatingProfile}
                               className={`w-full p-2 border-b-2 outline-none font-bold text-text-primary ${isEditing ? 'border-primary bg-yellow-50' : 'border-ui-border bg-transparent'}`}
                             />
                           </div>
                         ))}
                         {isEditing && (
                           <button type="submit" disabled={updatingProfile} className="col-span-2 bg-text-primary text-white py-3 font-black uppercase tracking-widest hover:bg-primary transition-colors">
                             {updatingProfile ? 'Guardando...' : 'Confirmar Cambios'}
                           </button>
                         )}
                      </form>
                   </motion.div>
                )}
                
                {/* Placeholder para Bills si es necesario, siguiendo la misma lógica */}
                {activeTab === 'bills' && <div className="text-center py-10 font-bold border-2 border-dashed border-ui-border text-text-muted">SIN FACTURAS PENDIENTES</div>}
              </>
            )}
          </div>
        </div>

        <AddressForm isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} onSubmit={handleAddressSubmit} />
        <ConfirmModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal({...confirmModal, isOpen: false})} onConfirm={confirmModal.onConfirm} title={confirmModal.title} message={confirmModal.message} type="danger" loading={confirmLoading} />
        <AlertModal isOpen={alertModal.isOpen} onClose={() => setAlertModal({...alertModal, isOpen: false})} title={alertModal.title} message={alertModal.message} type={alertModal.type} />
      </div>
    </div>
  );
};

export default Profile;