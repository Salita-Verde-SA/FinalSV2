import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { healthService } from '../services/healthService';
import { orderService } from '../services/orderService';
import { orderDetailService } from '../services/orderDetailService';
import { clientService } from '../services/clientService';
import { addressService } from '../services/addressService';

import ProductForm from '../components/admin/ProductForm';
import CategoryForm from '../components/admin/CategoryForm';
import LatencyChart from '../components/admin/LatencyChart';
import ConfirmModal from '../components/ui/ConfirmModal';
import AlertModal from '../components/ui/AlertModal';

import { useLatencyMonitor } from '../hooks/useLatencyMonitor';
import { 
  Plus, Edit, Trash2, Search, RefreshCw, Activity, 
  ShoppingBag, Eye, X, Layers, LogOut, Home
} from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  
  // --- ESTADOS DE DATOS ---
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // --- HOOK DE LATENCIA ---
  const { 
    latencyData, currentHealth, isMonitoring, 
    startMonitoring, stopMonitoring, connectionStatus 
  } = useLatencyMonitor(2000, 30);

  // --- ESTADOS DE MODALES Y EDICIÓN ---
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {}, type: 'danger' });
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  
  // --- ESTADOS DE ORDEN SELECCIONADA ---
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [orderClient, setOrderClient] = useState(null);
  const [orderAddress, setOrderAddress] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // --- MAPAS DE CONSTANTES (PARA VISUALIZACIÓN) ---
  const STATUS_MAP = { 1: 'Pendiente', 2: 'En Progreso', 3: 'Entregado', 4: 'Cancelado' };
  const DELIVERY_MAP = { 1: { label: 'Retiro', icon: '🏪' }, 2: { label: 'En Mano', icon: '🤝' }, 3: { label: 'Envío', icon: '🚚' } };

  // --- CARGA INICIAL DE DATOS ---
  const loadData = async () => {
    setLoading(true);
    try {
      const [prod, cat, sys] = await Promise.all([
        productService.getAll(), 
        categoryService.getAll(), 
        healthService.check()
      ]);
      setProducts(prod);
      setCategories(cat);
      setHealth(sys);
    } catch (e) { 
      console.error('Error cargando datos iniciales:', e);
    } finally { setLoading(false); }
  };

  const loadOrders = async () => {
    try {
      const data = await orderService.getAll();
      // Aseguramos que todas las órdenes tengan un ID usable
      setOrders(data.map(o => ({ ...o, id: o.id_key || o.id })));
    } catch (e) { console.error('Error cargando pedidos:', e); }
  };

  useEffect(() => { loadData(); }, []);
  useEffect(() => { if (activeTab === 'orders') loadOrders(); }, [activeTab]);
  useEffect(() => { if (currentHealth) setHealth(currentHealth); }, [currentHealth]);

  // --- FUNCIONES AUXILIARES DE UI ---
  const showAlert = (type, title, message) => setAlertModal({ isOpen: true, type, title, message });

  const getStatusColor = (s) => {
    const status = parseInt(s);
    if (status === 3) return 'text-green-500 border-green-500/20 bg-green-500/5';
    if (status === 4) return 'text-red-500 border-red-500/20 bg-red-500/5';
    if (status === 2) return 'text-blue-400 border-blue-500/20 bg-blue-500/5';
    return 'text-brand-accent border-brand-accent/20 bg-brand-accent/5'; // Pendiente (1)
  };

  // --- HANDLERS (LOGICA DE NEGOCIO) ---

  // 1. GESTIÓN DE PRODUCTOS
  const handleProductSubmit = async (data) => {
    try {
      if (editingProduct) {
        const u = await productService.update(editingProduct.id, data);
        setProducts(products.map(p => p.id === u.id ? u : p));
        showAlert('success', 'Actualizado', 'Producto modificado con éxito.');
      } else {
        const c = await productService.create(data);
        setProducts([...products, c]);
        showAlert('success', 'Creado', 'Nuevo producto en inventario.');
      }
      setIsProductModalOpen(false);
    } catch (e) { showAlert('error', 'Error', 'No se pudo procesar la solicitud.'); }
  };

  const handleDeleteProduct = (product) => {
    setConfirmModal({
      isOpen: true,
      title: '¿ELIMINAR COMPONENTE?',
      message: `Estás por eliminar "${product.name}" del sistema. Esta acción es irreversible.`,
      onConfirm: async () => {
        try {
          await productService.delete(product.id);
          setProducts(products.filter(p => p.id !== product.id));
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          showAlert('success', 'Eliminado', 'Producto eliminado correctamente.');
        } catch (e) {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          showAlert('error', 'Error', 'No se pudo eliminar (posiblemente tiene ventas asociadas).');
        }
      }
    });
  };

  // 2. GESTIÓN DE CATEGORÍAS
  const handleCategorySubmit = async (data) => {
    try {
      if (editingCategory) {
        const u = await categoryService.update(editingCategory.id, data);
        setCategories(categories.map(c => c.id === u.id ? u : c));
        showAlert('success', 'Categoría', 'Actualizada correctamente.');
      } else {
        const c = await categoryService.create(data);
        setCategories([...categories, c]);
        showAlert('success', 'Categoría', 'Creada correctamente.');
      }
      setIsCategoryModalOpen(false);
    } catch (e) { console.error(e); }
  };

  // 3. GESTIÓN DE ÓRDENES Y DETALLES
  const handleViewOrder = async (o) => {
    setSelectedOrder(o);
    setLoadingDetails(true);
    setOrderClient(null); 
    setOrderAddress(null);
    
    try {
      // Intentamos cargar los detalles básicos
      const details = await orderDetailService.getByOrderId(o.id);
      setOrderDetails(details);

      // Cargamos cliente y dirección por separado para que si uno falla, no rompa todo
      try {
          if (o.client_id) {
              const client = await clientService.getById(o.client_id);
              setOrderClient(client);
              const addresses = await addressService.getMyAddresses(o.client_id);
              if (addresses && addresses.length > 0) setOrderAddress(addresses[0]);
          }
      } catch (err) {
          console.warn("No se pudo cargar info del cliente (posible 404):", err);
      }

    } catch (e) { 
      console.error("Error cargando detalles orden:", e);
      showAlert('error', 'Error de Carga', 'No se pudieron cargar los productos del pedido.');
    } finally { 
      setLoadingDetails(false); 
    }
  };

  // --- LA FUNCIÓN QUE FALLABA (ESTADO) ---
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    if (!orderId) {
        showAlert('error', 'Error', 'ID de orden inválido');
        return;
    }
    
    setUpdatingStatus(true);
    try {
      // Llamada al servicio
      await orderService.updateStatus(orderId, newStatus);
      
      // Actualizar estado local (UI instantánea)
      setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      setOrders(prevOrders => prevOrders.map(o => 
        (o.id === orderId) ? { ...o, status: newStatus } : o
      ));
      
      showAlert('success', 'Estado Actualizado', `El pedido ahora está: ${STATUS_MAP[newStatus]}`);
    } catch (e) { 
      console.error("Error al actualizar estado:", e);
      // Mensaje de error más descriptivo
      const errorMsg = e.response?.status === 404 
        ? "No se encontró la ruta en el servidor (Error 404)" 
        : "Fallo de conexión al actualizar estado.";
      showAlert('error', 'Error', errorMsg); 
    } finally { 
      setUpdatingStatus(false); 
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-gray-200 font-sans selection:bg-brand-accent selection:text-black">
      {/* Barra Superior */}
      <div className="bg-black border-b border-white/5 px-6 py-2 flex justify-between items-center text-[10px] font-mono tracking-widest uppercase">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${connectionStatus === 'offline' ? 'bg-red-500 animate-pulse' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'}`}></div>
            SYSTEM_{connectionStatus === 'offline' ? 'OFFLINE' : 'ONLINE'}
          </span>
          <span className="text-white/30 hidden md:block">|</span>
          <span className="text-brand-accent">LATENCY: {latencyData[latencyData.length-1]?.latency || 0}MS</span>
        </div>
        <div className="flex gap-4">
          <button onClick={() => navigate('/')} className="hover:text-white transition-colors flex items-center gap-1"><Home size={10}/> Tienda</button>
          <button onClick={logout} className="text-red-500 hover:text-white transition-colors flex items-center gap-1"><LogOut size={10}/> Logout</button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-6 lg:p-10">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-end border-l-4 border-brand-accent pl-6">
          <div>
            <h1 className="text-5xl font-black italic text-white uppercase tracking-tighter leading-none mb-1">
              Admin<span className="text-brand-accent">Panel</span>
            </h1>
            <p className="text-gray-500 font-mono text-[10px] uppercase tracking-[0.2em]">Nexus Hardware Management // v2.6</p>
          </div>
          <div className="flex gap-2 mt-6 md:mt-0">
            <button onClick={loadData} className="p-4 bg-[#16191e] border border-white/10 hover:border-brand-accent text-white transition-all">
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''}/>
            </button>
            {activeTab !== 'orders' && (
              <button 
                onClick={() => { activeTab === 'products' ? setIsProductModalOpen(true) : setIsCategoryModalOpen(true); setEditingProduct(null); setEditingCategory(null); }}
                className="bg-brand-accent text-black font-black uppercase tracking-widest px-8 py-4 hover:bg-white transition-all flex items-center gap-2 text-sm"
              >
                <Plus size={18} strokeWidth={3}/> Nuevo {activeTab === 'products' ? 'Producto' : 'Categoría'}
              </button>
            )}
          </div>
        </header>

        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside className="col-span-12 lg:col-span-3 space-y-6">
            <div className="bg-[#16191e] border border-white/5 p-6 rounded-sm relative overflow-hidden">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-2">
                   <Activity size={14} className="text-brand-accent"/> Red en tiempo real
                 </h3>
                 <button onClick={isMonitoring ? stopMonitoring : startMonitoring} className={`text-[9px] font-bold px-2 py-0.5 rounded ${isMonitoring ? 'bg-red-500/10 text-red-500' : 'bg-brand-accent/10 text-brand-accent'}`}>
                    {isMonitoring ? 'STOP' : 'LIVE'}
                 </button>
               </div>
               <LatencyChart latencyData={latencyData} currentHealth={health} isMonitoring={isMonitoring} />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
               <div className="bg-[#16191e] p-5 border-l-2 border-brand-accent">
                  <p className="text-[9px] font-bold text-gray-500 uppercase mb-1">Items Totales</p>
                  <p className="text-3xl font-black text-white italic">{products.length}</p>
               </div>
               <div className="bg-[#16191e] p-5 border-l-2 border-white/10">
                  <p className="text-[9px] font-bold text-gray-500 uppercase mb-1">Ventas Procesadas</p>
                  <p className="text-3xl font-black text-white italic">{orders.length}</p>
               </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="col-span-12 lg:col-span-9">
            <div className="flex mb-6 border-b border-white/5 gap-2">
              {['products', 'categories', 'orders'].map(tab => (
                <button 
                  key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all ${
                    activeTab === tab ? 'text-brand-accent border-b-2 border-brand-accent bg-brand-accent/5' : 'text-gray-500 hover:text-white'
                  }`}
                >
                  {tab === 'products' ? 'Inventario' : tab === 'categories' ? 'Categorías' : 'Órdenes'}
                </button>
              ))}
            </div>

            <div className="bg-[#16191e] border border-white/5 shadow-2xl min-h-[400px]">
              <AnimatePresence mode="wait">
                {/* TAB PRODUCTOS */}
                {activeTab === 'products' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-1">
                    <div className="p-4 flex gap-4 border-b border-white/5">
                      <div className="relative flex-grow bg-black/40 border border-white/5 flex items-center px-4">
                        <Search size={16} className="text-gray-500"/>
                        <input 
                          className="bg-transparent w-full p-3 text-xs text-white outline-none font-mono uppercase" 
                          placeholder="FILTRAR POR NOMBRE O CATEGORÍA..." 
                          onChange={(e) => setSearchTerm(e.target.value)} 
                        />
                      </div>
                    </div>
                    <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-black/40 text-gray-500 font-mono uppercase">
                          <tr>
                            <th className="p-4">Componente</th>
                            <th className="p-4">Categoría</th>
                            <th className="p-4">Stock</th>
                            <th className="p-4">Precio</th>
                            <th className="p-4 text-right">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                            <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                              <td className="p-4 font-bold text-white uppercase">{p.name}</td>
                              <td className="p-4 text-gray-500"><span className="flex items-center gap-2"><Layers size={12}/> {p.category_name}</span></td>
                              <td className={`p-4 font-mono ${p.stock < 5 ? 'text-red-500' : ''}`}>{p.stock} units</td>
                              <td className="p-4 font-bold text-brand-accent">${p.price}</td>
                              <td className="p-4 text-right">
                                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => { setEditingProduct(p); setIsProductModalOpen(true); }} className="p-2 hover:bg-white hover:text-black text-gray-400"><Edit size={14}/></button>
                                  <button onClick={() => handleDeleteProduct(p)} className="p-2 hover:bg-red-600 hover:text-white text-gray-400"><Trash2 size={14}/></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}

                {/* TAB CATEGORIAS */}
                {activeTab === 'categories' && (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-1">
                      <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-black/40 text-gray-500 font-mono uppercase">
                            <tr>
                              <th className="p-4">ID</th>
                              <th className="p-4">Nombre</th>
                              <th className="p-4 text-right">Acción</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {categories.map(c => (
                              <tr key={c.id} className="hover:bg-white/[0.02] group">
                                <td className="p-4 font-mono text-gray-500">#{c.id}</td>
                                <td className="p-4 font-bold text-white uppercase">{c.name}</td>
                                <td className="p-4 text-right">
                                  <button onClick={() => { setEditingCategory(c); setIsCategoryModalOpen(true); }} className="p-2 hover:bg-white hover:text-black text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"><Edit size={14}/></button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                   </motion.div>
                )}

                {/* TAB ÓRDENES */}
                {activeTab === 'orders' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <table className="w-full text-left text-xs">
                      <thead className="bg-black/40 text-gray-500 font-mono uppercase">
                        <tr>
                          <th className="p-4">ID</th>
                          <th className="p-4">Fecha</th>
                          <th className="p-4">Total</th>
                          <th className="p-4">Estado</th>
                          <th className="p-4 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {orders.map(o => (
                          <tr key={o.id} className="hover:bg-white/[0.02]">
                            <td className="p-4 font-mono text-brand-accent">#{o.id}</td>
                            <td className="p-4 text-gray-400">{o.date ? new Date(o.date).toLocaleDateString() : '---'}</td>
                            <td className="p-4 font-bold">${parseFloat(o.total).toFixed(2)}</td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-sm border text-[9px] font-black uppercase ${getStatusColor(o.status)}`}>
                                {STATUS_MAP[o.status] || 'Desc.'}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button onClick={() => handleViewOrder(o)} className="text-white hover:bg-brand-accent hover:text-black px-3 py-1.5 transition-all uppercase font-black text-[10px] flex items-center gap-2 ml-auto">
                                <Eye size={14}/> Detalle
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>

      {/* --- MODAL DETALLE DE PEDIDO --- */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-[#16191e] border border-white/10 w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              {/* Header Modal */}
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
                <div>
                  <h2 className="text-2xl font-black italic uppercase">ORDEN <span className="text-brand-accent">#{selectedOrder.id}</span></h2>
                  <p className="text-[10px] font-mono text-gray-500">REF_ID: {selectedOrder.bill_id}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-white hover:text-black transition-colors rounded-full"><X/></button>
              </div>
              
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Columna Izquierda: Info + Botones */}
                <div className="space-y-6">
                  <div>
                    <label className="text-[9px] font-bold text-gray-600 uppercase tracking-widest block mb-2">Información de Entrega</label>
                    <div className="bg-black/40 p-4 border-l-2 border-brand-accent space-y-2">
                      <p className="text-sm font-bold text-white">
                        {orderClient ? `${orderClient.name} ${orderClient.lastname}` : (loadingDetails ? 'Cargando...' : 'Cliente no encontrado (404)')}
                      </p>
                      <p className="text-xs text-gray-400">
                        {orderAddress ? `${orderAddress.street} ${orderAddress.number}, ${orderAddress.city}` : (selectedOrder.delivery_method === 1 ? 'Retiro en local' : 'Sin dirección registrada')}
                      </p>
                      <p className="text-xs text-brand-accent font-mono pt-2">
                        {DELIVERY_MAP[selectedOrder.delivery_method]?.label || 'Método Desconocido'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-gray-600 uppercase tracking-widest block mb-2">Cambiar Estado</label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(STATUS_MAP).map(([val, label]) => {
                        const statusVal = parseInt(val);
                        const isActive = selectedOrder.status === statusVal;
                        return (
                          <button 
                            key={val} 
                            onClick={() => handleUpdateOrderStatus(selectedOrder.id, statusVal)}
                            disabled={updatingStatus}
                            className={`px-3 py-2 text-[10px] font-black uppercase transition-all border 
                              ${isActive 
                                ? 'bg-brand-accent text-black border-brand-accent' 
                                : 'bg-transparent text-gray-500 border-white/10 hover:border-white hover:text-white'
                              } ${updatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Columna Derecha: Productos */}
                <div className="bg-black/20 p-4 border border-white/5 rounded-sm flex flex-col h-full">
                  <label className="text-[9px] font-bold text-gray-600 uppercase tracking-widest block mb-3">Resumen de Carga</label>
                  
                  <div className="space-y-3 flex-grow overflow-y-auto pr-2 custom-scrollbar max-h-[200px]">
                    {orderDetails.length > 0 ? (
                      orderDetails.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs border-b border-white/5 pb-2 last:border-0">
                          <span className="text-gray-400 uppercase">
                            <span className="text-brand-accent font-mono font-bold mr-2">x{item.quantity}</span> 
                            {item.product_name}
                          </span>
                          <span className="font-mono text-white">${(item.subtotal || 0).toFixed(2)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-600 italic">Cargando productos...</p>
                    )}
                  </div>

                  <div className="mt-auto pt-4 border-t border-white/10">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-bold uppercase text-gray-500">Total Final</span>
                      <span className="text-3xl font-black text-brand-accent italic tracking-tighter">
                        ${parseFloat(selectedOrder.total).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- COMPONENTES AUXILIARES --- */}
      <ProductForm 
        isOpen={isProductModalOpen} 
        onClose={() => setIsProductModalOpen(false)} 
        onSubmit={handleProductSubmit} 
        initialData={editingProduct} 
        categories={categories} 
      />
      
      <CategoryForm 
        isOpen={isCategoryModalOpen} 
        onClose={() => setIsCategoryModalOpen(false)} 
        onSubmit={handleCategorySubmit} 
        initialData={editingCategory} 
      />
      
      <ConfirmModal 
        isOpen={confirmModal.isOpen} 
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} 
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title} 
        message={confirmModal.message} 
        type={confirmModal.type}
      />
      
      <AlertModal 
        isOpen={alertModal.isOpen} 
        onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))} 
        title={alertModal.title} 
        message={alertModal.message} 
        type={alertModal.type}
      />
    </div>
  );
};

export default AdminDashboard;