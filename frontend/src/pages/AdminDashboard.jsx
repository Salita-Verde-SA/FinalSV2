import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { healthService } from '../services/healthService';
import { orderService } from '../services/orderService';
import { orderDetailService } from '../services/orderDetailService';
import ProductForm from '../components/admin/ProductForm';
import CategoryForm from '../components/admin/CategoryForm';
import LatencyChart from '../components/admin/LatencyChart';
import ConfirmModal from '../components/ui/ConfirmModal';
import AlertModal from '../components/ui/AlertModal';
import { useLatencyMonitor } from '../hooks/useLatencyMonitor';
import { Package, ShoppingBag, Plus, Edit, Trash2, Search, Home, LogOut, Tag, Eye, X, RefreshCw, AlertCircle, Layers, Activity } from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { latencyData, currentHealth, isMonitoring, error: latencyError, connectionStatus, startMonitoring, stopMonitoring, clearData: clearLatencyData } = useLatencyMonitor(2000, 30);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {}, type: 'danger' });
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const showAlert = (type, title, message) => setAlertModal({ isOpen: true, type, title, message });
  const showConfirm = (title, message, onConfirm, type = 'danger') => setConfirmModal({ isOpen: true, title, message, onConfirm, type });

  const loadData = async () => {
    setLoading(true); setError('');
    try {
      const [prod, cat, sys] = await Promise.all([productService.getAll(), categoryService.getAll(), healthService.check()]);
      setProducts(prod); setCategories(cat); setHealth(sys);
    } catch (e) { setError('Fallo en telemetría del servidor'); } finally { setLoading(false); }
  };

  const loadOrders = async () => {
    try { setOrders(await orderService.getAll()); } catch (e) { setError('Error cargando órdenes'); }
  };

  useEffect(() => { loadData(); }, []);
  useEffect(() => { if (activeTab === 'orders') loadOrders(); }, [activeTab]);
  useEffect(() => { if (currentHealth) setHealth(currentHealth); }, [currentHealth]);

  const handleLogout = () => { logout(); navigate('/'); };
  
  // Handlers Productos
  const handleCreateProduct = () => { setEditingProduct(null); setIsProductModalOpen(true); };
  const handleEditProduct = (p) => { setEditingProduct(p); setIsProductModalOpen(true); };
  const handleDeleteProduct = (product) => {
    showConfirm('¿Desguazar Pieza?', `Se eliminará "${product.name}" del inventario.`, async () => {
      setConfirmLoading(true);
      try { await productService.delete(product.id); setProducts(products.filter(p => p.id !== product.id)); setConfirmModal({ ...confirmModal, isOpen: false }); showAlert('success', 'Eliminado', 'Producto retirado.'); } 
      catch (e) { setConfirmModal({ ...confirmModal, isOpen: false }); showAlert('error', 'Error', 'No se puede eliminar (posibles ventas asociadas).'); } 
      finally { setConfirmLoading(false); }
    });
  };
  const handleProductSubmit = async (d) => { 
    try {
      if(editingProduct) { const u = await productService.update(editingProduct.id, d); setProducts(products.map(p => p.id === u.id ? u : p)); } 
      else { const c = await productService.create(d); setProducts([...products, c]); } 
      setIsProductModalOpen(false); showAlert('success', 'Éxito', 'Inventario actualizado.');
    } catch (e) { throw e; }
  };

  // Handlers Categorías
  const handleCreateCategory = () => { setEditingCategory(null); setIsCategoryModalOpen(true); };
  const handleEditCategory = (c) => { setEditingCategory(c); setIsCategoryModalOpen(true); };
  const handleDeleteCategory = (cat) => {
    showConfirm('¿Eliminar Categoría?', `Se eliminará "${cat.name}".`, async () => {
      setConfirmLoading(true);
      try { await categoryService.delete(cat.id); setCategories(categories.filter(c => c.id !== cat.id)); setConfirmModal({ ...confirmModal, isOpen: false }); }
      catch (e) { setConfirmModal({ ...confirmModal, isOpen: false }); showAlert('error', 'Error', 'Categoría en uso.'); }
      finally { setConfirmLoading(false); }
    });
  };
  const handleCategorySubmit = async (d) => {
    try {
      if(editingCategory) { const u = await categoryService.update(editingCategory.id, d); setCategories(categories.map(c => c.id === u.id ? u : c)); }
      else { const c = await categoryService.create(d); setCategories([...categories, c]); }
      setIsCategoryModalOpen(false);
    } catch(e) { throw e; }
  };

  const handleViewOrder = async (o) => { setSelectedOrder(o); setLoadingDetails(true); try { setOrderDetails(await orderDetailService.getByOrderId(o.id)); } finally { setLoadingDetails(false); } };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.category_name && p.category_name.toLowerCase().includes(searchTerm.toLowerCase())));
  const getHealthColor = () => (connectionStatus === 'offline' || health?.status === 'offline') ? 'bg-red-500' : health?.status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500';

  return (
    <div className="min-h-screen bg-surface pt-6 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Dashboard Header */}
        <div className="bg-text-primary text-white p-6 mb-8 flex flex-col md:flex-row justify-between items-center shadow-lg border-b-4 border-primary">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded">
               <Activity size={24} className="text-primary animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-black italic uppercase tracking-tighter">VeloRace <span className="text-primary">Manager</span></h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2 h-2 rounded-full ${getHealthColor()}`}></span>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  System Status: {health?.status || 'OFFLINE'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <button onClick={loadData} className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-xs font-bold uppercase"><RefreshCw size={14}/> Refresh</button>
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-xs font-bold uppercase"><Home size={14}/> Storefront</button>
            <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-xs font-black uppercase tracking-wider transform -skew-x-12"><span className="transform skew-x-12 flex items-center gap-2"><LogOut size={14}/> Salir</span></button>
          </div>
        </div>

        {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 font-bold flex items-center gap-2"><AlertCircle size={20}/> {error}</div>}

        <div className="mb-8">
          <LatencyChart latencyData={latencyData} currentHealth={currentHealth} isMonitoring={isMonitoring} error={latencyError} onToggleMonitoring={isMonitoring ? stopMonitoring : startMonitoring} onClear={clearLatencyData} />
        </div>

        {/* Tabs */}
        <div className="flex border-b-2 border-ui-border mb-8">
          {['products', 'categories', 'orders'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 font-black uppercase tracking-wider text-sm border-b-4 transition-all ${activeTab === tab ? 'border-primary text-text-primary bg-white' : 'border-transparent text-text-secondary hover:text-primary'}`}>
              {tab === 'products' ? 'Inventario' : tab === 'categories' ? 'Categorías' : 'Carreras'}
            </button>
          ))}
        </div>

        {activeTab === 'products' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
              <div className="relative flex-grow max-w-md">
                <Search className="absolute left-3 top-2.5 text-text-muted" size={18} />
                <input type="text" placeholder="Buscar componente..." className="w-full pl-10 pr-4 py-2 border-2 border-ui-border font-bold text-sm outline-none focus:border-primary transition-colors" onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <button onClick={handleCreateProduct} className="bg-primary text-white font-black uppercase tracking-wider px-6 py-2 hover:bg-black transition-colors flex items-center gap-2 transform -skew-x-12"><span className="transform skew-x-12 flex items-center gap-2"><Plus size={18}/> Nuevo Item</span></button>
            </div>
            
            <div className="bg-white border border-ui-border shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-surface border-b border-ui-border">
                  <tr>
                    <th className="p-4 font-black text-xs uppercase text-text-secondary">Componente</th>
                    <th className="p-4 font-black text-xs uppercase text-text-secondary">Precio</th>
                    <th className="p-4 font-black text-xs uppercase text-text-secondary">Stock</th>
                    <th className="p-4 font-black text-xs uppercase text-text-secondary">Categoría</th>
                    <th className="p-4 text-right font-black text-xs uppercase text-text-secondary">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ui-border">
                  {filteredProducts.map(p => (
                    <tr key={p.id} className="hover:bg-orange-50 transition-colors group">
                      <td className="p-4 font-bold text-text-primary">{p.name}</td>
                      <td className="p-4 font-mono text-primary font-bold">${p.price}</td>
                      <td className="p-4 text-sm font-medium">{p.stock}</td>
                      <td className="p-4"><span className="bg-surface border border-ui-border px-2 py-1 text-xs font-bold uppercase">{p.category_name}</span></td>
                      <td className="p-4 text-right opacity-50 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditProduct(p)} className="text-blue-600 hover:text-blue-800 mr-3"><Edit size={18}/></button>
                        <button onClick={() => handleDeleteProduct(p)} className="text-red-500 hover:text-red-700"><Trash2 size={18}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'categories' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between mb-6">
              <h2 className="text-xl font-black italic uppercase">Categorías de Equipo</h2>
              <button onClick={handleCreateCategory} className="bg-text-primary text-white font-black uppercase px-6 py-2 hover:bg-black transition-colors flex items-center gap-2 transform -skew-x-12"><span className="transform skew-x-12 flex items-center gap-2"><Plus size={18}/> Nueva</span></button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map(c => (
                <div key={c.id} className="bg-white p-5 border-l-4 border-ui-border hover:border-l-primary shadow-sm flex justify-between items-center group transition-all">
                  <span className="font-bold uppercase text-sm">{c.name}</span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditCategory(c)} className="text-blue-500"><Edit size={16}/></button>
                    <button onClick={() => handleDeleteCategory(c)} className="text-red-500"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'orders' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white border border-ui-border shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-surface border-b border-ui-border">
                  <tr>
                    <th className="p-4 font-black text-xs uppercase text-text-secondary">Orden #</th>
                    <th className="p-4 font-black text-xs uppercase text-text-secondary">Fecha</th>
                    <th className="p-4 font-black text-xs uppercase text-text-secondary">Total</th>
                    <th className="p-4 font-black text-xs uppercase text-text-secondary">Estado</th>
                    <th className="p-4 text-right font-black text-xs uppercase text-text-secondary">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ui-border">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-orange-50 transition-colors">
                      <td className="p-4 font-mono font-bold text-primary">#{o.id}</td>
                      <td className="p-4 text-sm font-medium">{o.date}</td>
                      <td className="p-4 font-black">${parseFloat(o.total).toFixed(2)}</td>
                      <td className="p-4"><span className="bg-text-primary text-white px-2 py-0.5 text-xs font-bold uppercase">{o.status}</span></td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleViewOrder(o)} className="text-text-secondary hover:text-primary"><Eye size={18}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Modales */}
        <ProductForm isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} onSubmit={handleProductSubmit} initialData={editingProduct} categories={categories} />
        <CategoryForm isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} onSubmit={handleCategorySubmit} initialData={editingCategory} />
        <ConfirmModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} onConfirm={confirmModal.onConfirm} title={confirmModal.title} message={confirmModal.message} type={confirmModal.type} loading={confirmLoading} />
        <AlertModal isOpen={alertModal.isOpen} onClose={() => setAlertModal({ ...alertModal, isOpen: false })} title={alertModal.title} message={alertModal.message} type={alertModal.type} />

        {/* Modal Detalle Orden */}
        <AnimatePresence>
          {selectedOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white w-full max-w-lg border-2 border-ui-border shadow-2xl">
                <div className="bg-text-primary text-white p-4 flex justify-between items-center">
                  <h3 className="font-black italic uppercase text-lg">Orden #{selectedOrder.id}</h3>
                  <button onClick={() => setSelectedOrder(null)}><X size={20}/></button>
                </div>
                <div className="p-6">
                  {loadingDetails ? <div className="text-center font-bold">Cargando telemetría...</div> : (
                    <ul className="space-y-2">
                      {orderDetails.map((item, idx) => (
                        <li key={idx} className="flex justify-between text-sm border-b border-dashed border-ui-border pb-2">
                          <span className="font-medium text-text-primary">{item.quantity}x {item.product_name}</span>
                          <span className="font-bold text-primary">${item.subtotal?.toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-6 text-right pt-4 border-t-2 border-ui-border">
                    <span className="text-2xl font-black italic text-text-primary">${parseFloat(selectedOrder.total).toFixed(2)}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;