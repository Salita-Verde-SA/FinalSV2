import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { healthService } from '../services/healthService';
import { orderService } from '../services/orderService';
import { orderDetailService } from '../services/orderDetailService';
import { clientService } from '../services/clientService';
import { billService } from '../services/billService';
import ProductForm from '../components/admin/ProductForm';
import CategoryForm from '../components/admin/CategoryForm';
import LatencyChart from '../components/admin/LatencyChart';
import ConfirmModal from '../components/ui/ConfirmModal';
import AlertModal from '../components/ui/AlertModal';
import { useLatencyMonitor } from '../hooks/useLatencyMonitor';
import { 
  Package, ShoppingBag, Plus, Edit, Trash2, Search, Home, 
  LogOut, Tag, Eye, X, RefreshCw, Activity, Users, FileText, TrendingUp, ChevronRight, Zap 
} from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  
  // ESTADOS DE DATOS
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [health, setHealth] = useState(null);
  
  // ESTADOS DE UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // TELEMETRÍA
  const { latencyData, currentHealth, isMonitoring, error: latencyError, connectionStatus, startMonitoring, stopMonitoring, clearData: clearLatencyData } = useLatencyMonitor(2000, 30);

  // ESTADOS DE MODALES
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

  // HELPERS DE MODALES
  const showAlert = (type, title, message) => setAlertModal({ isOpen: true, type, title: title.toUpperCase(), message: message.toUpperCase() });
  const showConfirm = (title, message, onConfirm, type = 'danger') => setConfirmModal({ isOpen: true, title: title.toUpperCase(), message: message.toUpperCase(), onConfirm, type });

  // CARGA DE DATOS
  const loadInitialData = async () => {
    setLoading(true);
    setError('');
    try {
      const [prod, cat, sys, ord, cli] = await Promise.all([
        productService.getAll(),
        categoryService.getAll(),
        healthService.check(),
        orderService.getAll(),
        clientService.getAll()
      ]);
      setProducts(prod);
      setCategories(cat);
      setHealth(sys);
      setOrders(ord);
      setClients(cli);
    } catch (e) {
      console.error("ERROR EN CARGA:", e);
      setError('ERROR EN LA SINCRONIZACIÓN DE DATOS.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadInitialData(); }, []);
  useEffect(() => { if (currentHealth) setHealth(currentHealth); }, [currentHealth]);

  // HELPER PARA CATEGORÍAS
  const getCategoryName = (categoryId) => {
    const found = categories.find(c => (c.id_key || c.id) === categoryId);
    return found ? found.name.toUpperCase() : "SIN CATEGORÍA";
  };

  const stats = useMemo(() => ({
    totalRevenue: orders.reduce((acc, curr) => acc + parseFloat(curr.total || 0), 0),
    lowStock: products.filter(p => p.stock < 5).length,
    activeClients: clients.length
  }), [orders, products, clients]);

  const handleLogout = () => { logout(); navigate('/'); };

  // --- FUNCIÓN DE VENTA CORREGIDA (SOLUCIONA EL ERROR MECÁNICO) ---
  const handleSimulateSale = async () => {
    showConfirm('¿SIMULAR VENTA?', 'SE GENERARÁ UN CLIENTE, FACTURA Y ORDEN EN TIEMPO REAL.', async () => {
      setConfirmLoading(true);
      try {
        // 1. Validar que exista al menos un producto con stock
        const product = products.find(p => p.stock > 0);
        if (!product) throw new Error("NO HAY PRODUCTOS CON STOCK DISPONIBLE.");

        // 2. Crear Cliente (Para obtener un client_id válido)
        const timestamp = Date.now();
        const newClient = await clientService.create({
          name: "PILOTO",
          lastname: `PRUEBA-${timestamp}`,
          email: `racer${timestamp}@velorace.com`,
          telephone: "+5491100000000"
        });

        if (!newClient || !newClient.id_key) throw new Error("ERROR AL CREAR CLIENTE");

        // 3. Crear Factura (Para obtener un bill_id válido)
        const newBill = await billService.create({
          bill_number: `F-${timestamp}`,
          date: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
          total: product.price,
          payment_type: "card",
          discount: 0
        });

        if (!newBill || !newBill.id_key) throw new Error("ERROR AL CREAR FACTURA");

        // 4. Crear Orden (Usando los IDs reales generados arriba)
        const newOrder = await orderService.createOrder({
          total: product.price,
          delivery_method: 1, // 1: Drive Thru
          status: 1,          // 1: Pending
          client_id: newClient.id_key,
          bill_id: newBill.id_key
        });

        if (!newOrder || !newOrder.id_key) throw new Error("ERROR AL CREAR ORDEN");

        // 5. Crear Detalle de Orden (Vincula el producto y descuenta stock)
        await orderDetailService.create({ // Asumiendo que orderDetailService tiene método create
          order_id: newOrder.id_key,
          product_id: product.id_key,
          quantity: 1,
          price: product.price
        });

        setConfirmModal({ ...confirmModal, isOpen: false });
        showAlert('success', 'VICTORIA', `VENTA DE "${product.name.toUpperCase()}" REGISTRADA CORRECTAMENTE.`);
        
        // Recargar datos para reflejar cambios en stock y tablas
        await loadInitialData(); 

      } catch (e) {
        console.error("ERROR EN VENTA:", e);
        setConfirmModal({ ...confirmModal, isOpen: false });
        // Mostrar el mensaje exacto del backend si existe
        const msg = e.response?.data?.detail || e.message || 'NO SE PUDO COMPLETAR LA OPERACIÓN.';
        showAlert('error', 'FALLO MECÁNICO', typeof msg === 'object' ? JSON.stringify(msg) : msg);
      } finally {
        setConfirmLoading(false);
      }
    }, 'success');
  };

  // --- HANDLERS PRODUCTOS ---
  const handleProductSubmit = async (d) => {
    try {
      if (editingProduct) {
        const u = await productService.update(editingProduct.id_key || editingProduct.id, d);
        setProducts(products.map(p => (p.id_key || p.id) === (u.id_key || u.id) ? u : p));
      } else {
        const c = await productService.create(d);
        setProducts([...products, c]);
      }
      setIsProductModalOpen(false);
      showAlert('success', 'ÉXITO', 'INVENTARIO ACTUALIZADO.');
    } catch (e) { 
      showAlert('error', 'ERROR', 'NO SE PUDO GUARDAR EL PRODUCTO.'); 
    }
  };

  const handleDeleteProduct = (product) => {
    showConfirm('¿DESGUAZAR PIEZA?', `SE ELIMINARÁ "${product.name.toUpperCase()}".`, async () => {
      setConfirmLoading(true);
      try {
        await productService.delete(product.id_key || product.id);
        setProducts(products.filter(p => (p.id_key || p.id) !== (product.id_key || product.id)));
        setConfirmModal({ ...confirmModal, isOpen: false });
        showAlert('success', 'ELIMINADO', 'PIEZA RETIRADA.');
      } catch (e) {
        setConfirmModal({ ...confirmModal, isOpen: false });
        showAlert('error', 'ERROR CRÍTICO', 'PIEZA EN USO (TIENE VENTAS).');
      } finally { setConfirmLoading(false); }
    });
  };

  // --- HANDLERS CATEGORÍAS ---
  const handleCategorySubmit = async (d) => {
    try {
      if (editingCategory) {
        const u = await categoryService.update(editingCategory.id_key || editingCategory.id, d);
        setCategories(categories.map(c => (c.id_key || c.id) === (u.id_key || u.id) ? u : c));
      } else {
        const c = await categoryService.create(d);
        setCategories([...categories, c]);
      }
      setIsCategoryModalOpen(false);
      showAlert('success', 'ÉXITO', 'CATEGORÍA GUARDADA.');
    } catch (e) { showAlert('error', 'ERROR', 'FALLO AL PROCESAR.'); }
  };

  const handleDeleteCategory = (cat) => {
    showConfirm('¿ELIMINAR?', `SE BORRARÁ LA CATEGORÍA "${cat.name.toUpperCase()}".`, async () => {
      setConfirmLoading(true);
      try {
        await categoryService.delete(cat.id_key || cat.id);
        setCategories(categories.filter(c => (c.id_key || c.id) !== (cat.id_key || cat.id)));
        setConfirmModal({ ...confirmModal, isOpen: false });
        showAlert('success', 'ELIMINADO', 'CATEGORÍA BORRADA.');
      } catch (e) {
        setConfirmModal({ ...confirmModal, isOpen: false });
        showAlert('error', 'ERROR', 'CATEGORÍA CON PRODUCTOS ASOCIADOS.');
      } finally { setConfirmLoading(false); }
    });
  };

  const handleCreateCategory = () => { setEditingCategory(null); setIsCategoryModalOpen(true); };
  const handleEditCategory = (c) => { setEditingCategory(c); setIsCategoryModalOpen(true); };

  // --- HANDLERS ORDENES Y OTROS ---
  const handleViewOrder = async (o) => {
    setSelectedOrder(o);
    setLoadingDetails(true);
    try { 
      // Soporte para id_key o id según venga del backend
      const id = o.id_key || o.id;
      setOrderDetails(await orderDetailService.getByOrderId(id)); 
    } catch (err) {
      showAlert('error', 'ERROR', 'NO SE PUDO CARGAR EL DETALLE.');
    } finally { 
      setLoadingDetails(false); 
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    getCategoryName(p.category_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getHealthColor = () => (connectionStatus === 'offline' || health?.status === 'offline') ? 'bg-red-500' : health?.status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500';

  return (
    <div className="min-h-screen bg-[#F1F5F9] pt-6 pb-12 px-4 font-sans uppercase italic">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <header className="bg-slate-900 text-white p-6 mb-8 flex flex-col md:flex-row justify-between items-center shadow-2xl border-b-4 border-orange-600 rounded-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-600 rounded-sm transform -rotate-3">
               <Activity size={28} className="text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter leading-none">VELORACE <span className="text-orange-500 underline decoration-2 underline-offset-4">HQ</span></h1>
              <div className="flex items-center gap-2 mt-2">
                <span className={`w-2.5 h-2.5 rounded-full ${getHealthColor()} shadow-[0_0_8px_rgba(249,115,22,0.5)]`}></span>
                <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em]">TELEMETRY STATUS: {health?.status?.toUpperCase() || 'OFFLINE'}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-6 md:mt-0 italic font-black">
            <button onClick={loadInitialData} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 text-[10px] border border-slate-700"><RefreshCw size={14}/> SINCRONIZAR</button>
            <button onClick={() => navigate('/')} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 text-[10px] border border-slate-700"><Home size={14}/> PORTAL</button>
            <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 text-[10px] transform -skew-x-12"><LogOut size={14}/> SALIR</button>
          </div>
        </header>

        {/* STATS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 italic">
          <div className="lg:col-span-2">
            <LatencyChart latencyData={latencyData} currentHealth={currentHealth} isMonitoring={isMonitoring} error={latencyError} onToggleMonitoring={isMonitoring ? stopMonitoring : startMonitoring} onClear={clearLatencyData} />
          </div>
          <div className="grid grid-cols-2 gap-4 uppercase font-black">
            <div className="bg-white p-4 border-b-4 border-blue-500 shadow-sm">
              <TrendingUp className="text-blue-500 mb-2" size={20}/>
              <p className="text-[10px] text-slate-400">VENTAS TOTALES</p>
              <p className="text-xl text-slate-800">${stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 border-b-4 border-orange-500 shadow-sm">
              <ShoppingBag className="text-orange-500 mb-2" size={20}/>
              <p className="text-[10px] text-slate-400">ÓRDENES</p>
              <p className="text-xl text-slate-800">{orders.length}</p>
            </div>
            <div className="bg-white p-4 border-b-4 border-green-500 shadow-sm">
              <Users className="text-green-500 mb-2" size={20}/>
              <p className="text-[10px] text-slate-400">CLIENTES</p>
              <p className="text-xl text-slate-800">{stats.activeClients}</p>
            </div>
            <div className="bg-white p-4 border-b-4 border-red-500 shadow-sm">
              <Package className="text-red-500 mb-2" size={20}/>
              <p className="text-[10px] text-slate-400">BAJO STOCK</p>
              <p className="text-xl text-slate-800">{stats.lowStock}</p>
            </div>
          </div>
        </div>

        {/* NAV */}
        <nav className="flex flex-wrap gap-2 mb-8 bg-white p-1 shadow-sm border border-slate-200 italic font-black">
          {[ { id: 'overview', label: 'DASHBOARD', icon: Activity }, { id: 'products', label: 'INVENTARIO', icon: Package }, { id: 'categories', label: 'CATEGORÍAS', icon: Tag }, { id: 'orders', label: 'ÓRDENES', icon: ShoppingBag }, { id: 'clients', label: 'PILOTOS', icon: Users } ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-6 py-3 text-xs transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white transform -translate-y-1 shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </nav>

        {/* CONTENIDO */}
        <AnimatePresence mode="wait">
          {activeTab === 'products' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
                <div className="relative flex-grow max-w-md">
                  <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input type="text" placeholder="BUSCAR COMPONENTE..." className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 font-bold text-sm focus:border-orange-500 outline-none uppercase" onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  {/* BOTÓN DE COMPRA RÁPIDA (SIMULACIÓN) */}
                  <button onClick={handleSimulateSale} className="bg-green-600 text-white font-black px-6 py-3 hover:bg-green-700 transform -skew-x-12 shadow-lg flex items-center gap-2">
                    <span className="transform skew-x-12 flex items-center gap-2"><Zap size={18}/> VENTA TEST</span>
                  </button>
                  <button onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }} className="bg-orange-600 text-white font-black px-8 py-3 hover:bg-black transform -skew-x-12 shadow-lg">
                    <span className="transform skew-x-12 flex items-center gap-2"><Plus size={18}/> NUEVA PIEZA</span>
                  </button>
                </div>
              </div>
              
              <div className="bg-white shadow-xl overflow-hidden border border-slate-200 uppercase font-bold">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b-2 border-slate-200 text-[10px] text-slate-500">
                    <tr><th className="p-5">COMPONENTE</th><th className="p-5 text-center">STOCK</th><th className="p-5">PRECIO</th><th className="p-5">CATEGORÍA</th><th className="p-5 text-right">ACCIONES</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {filteredProducts.map(p => (
                      <tr key={p.id_key || p.id} className="hover:bg-orange-50/50 group transition-colors">
                        <td className="p-5">{p.name.toUpperCase()}</td>
                        <td className="p-5 text-center">
                          <span className={p.stock < 5 ? 'text-red-600' : ''}>{p.stock} UNITS</span>
                        </td>
                        <td className="p-5 font-mono text-orange-600">${p.price}</td>
                        <td className="p-5">
                          <span className="bg-slate-800 text-white px-2 py-1 text-[10px] italic">{getCategoryName(p.category_id)}</span>
                        </td>
                        <td className="p-5 text-right opacity-40 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingProduct(p); setIsProductModalOpen(true); }} className="p-2 text-blue-600 mr-2"><Edit size={18}/></button>
                          <button onClick={() => handleDeleteProduct(p)} className="p-2 text-red-500"><Trash2 size={18}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'categories' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-slate-800">CATEGORÍAS DE EQUIPO</h2>
                <button onClick={handleCreateCategory} className="bg-slate-900 text-white font-black px-6 py-2 transform -skew-x-12 shadow-md hover:bg-orange-600 uppercase"><Plus size={18}/> NUEVA</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-bold uppercase">
                {categories.map(c => (
                  <div key={c.id_key || c.id} className="bg-white p-5 border-l-4 border-slate-300 hover:border-orange-500 shadow-sm flex justify-between items-center group transition-all">
                    <span>{c.name}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => handleEditCategory(c)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit size={16}/></button>
                      <button onClick={() => handleDeleteCategory(c)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 uppercase font-bold">
              <div className="bg-white shadow-xl border border-slate-200">
                <table className="w-full text-left">
                  <thead className="bg-slate-900 text-white text-[10px]">
                    <tr><th className="p-4">RACE ORDER</th><th className="p-4">TIMESTAMP</th><th className="p-4">PAYOUT</th><th className="p-4">STATUS</th><th className="p-4 text-right">TELEMETRY</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 italic">
                    {orders.map(o => (
                      <tr key={o.id_key || o.id} className="hover:bg-slate-50 transition-all group">
                        <td className="p-4 font-mono font-black text-orange-600">#{o.id_key || o.id}</td>
                        <td className="p-4 text-xs text-slate-500">{new Date(o.date).toLocaleString()}</td>
                        <td className="p-4 text-slate-800">${parseFloat(o.total).toFixed(2)}</td>
                        <td className="p-4"><span className="bg-orange-100 text-orange-700 px-3 py-1 text-[10px] font-black border border-orange-200">{o.status}</span></td>
                        <td className="p-4 text-right"><button onClick={() => handleViewOrder(o)} className="bg-slate-100 p-2 text-slate-600 hover:bg-orange-600 hover:text-white transition-all shadow-sm"><Eye size={18}/></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'clients' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 uppercase font-bold italic">
               {clients.map(c => (
                 <div key={c.id_key || c.id} className="bg-white p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative group">
                   <div className="absolute top-0 right-0 p-2 bg-slate-50 text-[10px] font-mono text-slate-400">ID: {c.id_key || c.id}</div>
                   <h4 className="text-slate-800 underline decoration-orange-500">{c.name} {c.lastname}</h4>
                   <p className="text-xs text-slate-500 mt-2">{c.email}</p>
                   <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
                     <span className="text-[10px] text-slate-400">RACING PROFILE</span>
                     <button className="text-orange-600 hover:text-black text-[10px] flex items-center gap-1">HISTORIAL <ChevronRight size={14}/></button>
                   </div>
                 </div>
               ))}
             </motion.div>
          )}
        </AnimatePresence>

        {/* MODALES */}
        <ProductForm isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} onSubmit={handleProductSubmit} initialData={editingProduct} categories={categories} />
        <CategoryForm isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} onSubmit={handleCategorySubmit} initialData={editingCategory} />
        <ConfirmModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} onConfirm={confirmModal.onConfirm} title={confirmModal.title} message={confirmModal.message} type={confirmModal.type} loading={confirmLoading} />
        <AlertModal isOpen={alertModal.isOpen} onClose={() => setAlertModal({ ...alertModal, isOpen: false })} title={alertModal.title} message={alertModal.message} type={alertModal.type} />

        {/* DETALLE ORDEN */}
        <AnimatePresence>
          {selectedOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md italic font-black">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-2xl shadow-2xl border-t-8 border-orange-600 uppercase">
                <div className="p-8 text-slate-900">
                  <div className="flex justify-between items-start mb-8 border-b-2 border-slate-100 pb-4">
                    <div>
                      <h3 className="text-3xl">REGISTRO DE CARRERA</h3>
                      <p className="text-orange-600 font-mono">ORDER_ID: #{selectedOrder.id_key || selectedOrder.id}</p>
                    </div>
                    <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-slate-100"><X size={24}/></button>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-slate-50 p-4 border-l-4 border-slate-900">
                       <p className="text-[10px] text-slate-400 mb-1">STATUS DE ENTREGA</p>
                       <span className="bg-slate-900 text-white px-3 py-1 text-xs">{selectedOrder.status}</span>
                    </div>
                    {loadingDetails ? (
                      <div className="py-12 text-center animate-pulse text-slate-300">ESCANEANDO TELEMETRÍA...</div>
                    ) : (
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b-2 border-slate-100 text-slate-400">
                            <th className="text-left pb-2 font-black">ITEM</th>
                            <th className="text-center pb-2 font-black">QTY</th>
                            <th className="text-right pb-2 font-black">SUBTOTAL</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orderDetails.map((item, idx) => (
                            <tr key={idx} className="border-b border-slate-50">
                              <td className="py-3">{item.product_name || `PROD_ID: ${item.product_id}`}</td>
                              <td className="py-3 text-center font-mono">{item.quantity}</td>
                              <td className="py-3 text-right text-orange-600">${item.subtotal?.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                    <div className="pt-6 border-t-4 border-double border-slate-200 flex justify-between items-end">
                      <button className="flex items-center gap-2 text-[10px] bg-slate-900 text-white px-4 py-2 hover:bg-orange-600 transition-all"><FileText size={14}/> VER FACTURA DIGITAL</button>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400">TOTAL CARRERA</p>
                        <p className="text-4xl italic">${parseFloat(selectedOrder.total).toFixed(2)}</p>
                      </div>
                    </div>
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