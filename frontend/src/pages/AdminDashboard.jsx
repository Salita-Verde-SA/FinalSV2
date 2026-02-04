import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { healthService } from '../services/healthService';
import { orderService } from '../services/orderService';
import ProductForm from '../components/admin/ProductForm';
import CategoryForm from '../components/admin/CategoryForm';
import LatencyChart from '../components/admin/LatencyChart';
import { useLatencyMonitor } from '../hooks/useLatencyMonitor';
import { 
  Plus, Edit, Trash2, Search, RefreshCw, Activity, Gauge, Box 
} from 'lucide-react'; 
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
  const [searchTerm, setSearchTerm] = useState('');

  // Hook de monitoreo (asegúrate de que LatencyChart.jsx esté actualizado con la versión "blindada")
  const { latencyData, isMonitoring, startMonitoring, stopMonitoring } = useLatencyMonitor(2000, 30);

  // Estados de Modales
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Carga inicial de datos
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
      console.error('Error cargando panel de control', e);
    } finally { 
      setLoading(false); 
    }
  };

  const loadOrders = async () => { 
    try { setOrders(await orderService.getAll()); } catch (e) {} 
  };

  useEffect(() => { loadData(); }, []);
  useEffect(() => { if (activeTab === 'orders') loadOrders(); }, [activeTab]);

  // --- HANDLERS (LOGICA DE GUARDADO) ---

  // 1. Guardar Categoría
  const handleCategorySubmit = async (data) => {
    try {
      if (editingCategory) {
        // Editar
        const updated = await categoryService.update(editingCategory.id, data);
        setCategories(prev => prev.map(c => c.id === updated.id ? updated : c));
      } else {
        // Crear
        const created = await categoryService.create(data);
        // Si el backend no devuelve el objeto completo, usamos data + timestamp temporal
        const newCat = created || { ...data, id: Date.now() }; 
        setCategories(prev => [...prev, newCat]);
      }
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
    } catch (e) {
      console.error("Error guardando categoría:", e);
      alert("Error al conectar con la base de datos");
    }
  };

  // 2. Guardar Producto
  const handleProductSubmit = async (data) => {
    try {
      if (editingProduct) {
        await productService.update(editingProduct.id, data);
        loadData();
      } else {
        await productService.create(data);
        loadData();
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
    } catch (e) {
      console.error("Error guardando producto:", e);
      alert("Error al guardar el producto");
    }
  };

  // 3. Eliminar Producto
  const handleDeleteProduct = async (product) => {
    if(!window.confirm(`¿Eliminar ${product.name}?`)) return;
    try {
        await productService.delete(product.id);
        setProducts(prev => prev.filter(p => p.id !== product.id));
    } catch (e) {
        console.error(e);
        alert("No se pudo eliminar el producto");
    }
  };

  // Traducción de Tabs
  const tabLabels = {
    products: 'Productos',
    categories: 'Categorías',
    orders: 'Pedidos'
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-gray-200 font-sans selection:bg-brand-accent selection:text-black">
      {/* Topbar System Status */}
      <div className="bg-black border-b border-white/10 px-6 py-2 flex justify-between items-center text-[10px] font-mono uppercase tracking-widest">
        <div className="flex items-center gap-4 text-white/40">
          <span className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${health?.status === 'healthy' ? 'bg-green-500 shadow-[0_0_10px_lime]' : 'bg-red-500'}`}></div> 
            ESTADO_SISTEMA: {health?.status === 'healthy' ? 'EN LÍNEA' : 'DESCONECTADO'}
          </span>
          <span>LATENCIA: {latencyData[latencyData.length-1]?.latency || 0}ms</span>
        </div>
        <div className="flex gap-6">
          <button onClick={() => navigate('/')} className="hover:text-brand-accent transition-colors">Ver Tienda</button>
          <button onClick={logout} className="text-red-500 hover:text-white transition-colors">Cerrar Sesión</button>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto p-6 lg:p-10">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-end border-l-4 border-brand-accent pl-6">
          <div>
            <h1 className="text-5xl font-black italic text-white uppercase tracking-tighter leading-none mb-1">
              Panel de <span className="text-brand-accent">Control</span>
            </h1>
            <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">Centro de Operaciones VeloRace v2.4</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
             <button onClick={loadData} className="p-4 bg-[#16191e] border border-white/10 hover:border-white transition-all text-white" title="Recargar Datos">
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''}/>
             </button>
             {activeTab === 'products' && (
                <button onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }} className="bg-brand-accent text-black font-black uppercase tracking-widest px-6 py-4 hover:bg-white transition-colors flex items-center gap-2">
                  <Plus size={18} strokeWidth={3}/> Nuevo Producto
                </button>
             )}
             {activeTab === 'categories' && (
                <button onClick={() => { setEditingCategory(null); setIsCategoryModalOpen(true); }} className="bg-brand-accent text-black font-black uppercase tracking-widest px-6 py-4 hover:bg-white transition-colors flex items-center gap-2">
                  <Plus size={18} strokeWidth={3}/> Nueva Categoría
                </button>
             )}
          </div>
        </header>

        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar Metrics */}
          <aside className="col-span-12 lg:col-span-3 space-y-6">
            <div className="bg-[#16191e] border border-white/5 p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity"><Gauge size={60}/></div>
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                <Activity size={14} className="text-brand-accent"/> Latencia en Vivo
              </h3>
              {/* LatencyChart */}
              <LatencyChart 
                latencyData={latencyData} 
                currentHealth={health}
                isMonitoring={isMonitoring} 
                onToggleMonitoring={isMonitoring ? stopMonitoring : startMonitoring} 
              />
            </div>
            
            <div className="grid grid-cols-1 gap-2">
               <div className="bg-[#16191e] p-4 border-l-2 border-brand-accent">
                 <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Inventario Total</span>
                 <span className="text-3xl font-black text-white italic">{products.length}</span>
               </div>
               <div className="bg-[#16191e] p-4 border-l-2 border-white/20">
                 <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Categorías Activas</span>
                 <span className="text-3xl font-black text-white italic">{categories.length}</span>
               </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="col-span-12 lg:col-span-9">
            <div className="flex mb-8 border-b border-white/5">
              {['products', 'categories', 'orders'].map(tab => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-4 text-xs font-black uppercase tracking-widest transition-all ${
                    activeTab === tab ? 'text-brand-accent border-b-2 border-brand-accent bg-white/5' : 'text-gray-500 hover:text-white'
                  }`}
                >
                  {tabLabels[tab]}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="bg-[#16191e] border border-white/5 min-h-[500px] p-1">
              <AnimatePresence mode="wait">
                
                {/* TAB PRODUCTOS */}
                {activeTab === 'products' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="p-4 border-b border-white/5 flex gap-4">
                      <div className="relative flex-grow bg-black/20 border border-white/10 flex items-center px-4">
                        <Search size={16} className="text-gray-500"/>
                        <input className="bg-transparent w-full p-3 text-sm text-white outline-none font-mono uppercase placeholder:text-gray-700" placeholder="BUSCAR POR NOMBRE..." onChange={(e) => setSearchTerm(e.target.value)} />
                      </div>
                    </div>
                    <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                      {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                        <div key={p.id} className="flex items-center justify-between p-4 border-b border-white/5 hover:bg-white/5 transition-colors group">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-black flex items-center justify-center text-gray-600 font-black"><Box size={16}/></div>
                            <div>
                              <h4 className="font-bold text-white uppercase text-sm">{p.name}</h4>
                              <div className="flex gap-3 text-[10px] font-mono text-gray-500 mt-1">
                                <span>STOCK: <span className={p.stock < 3 ? "text-red-500" : "text-white"}>{p.stock}</span></span>
                                <span>CAT: {p.category_name}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <span className="font-mono text-brand-accent font-bold">${p.price}</span>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { setEditingProduct(p); setIsProductModalOpen(true); }} className="p-2 hover:bg-white hover:text-black text-gray-400 transition-colors" title="Editar"><Edit size={16}/></button>
                              <button onClick={() => handleDeleteProduct(p)} className="p-2 hover:bg-red-500 hover:text-white text-gray-400 transition-colors" title="Eliminar"><Trash2 size={16}/></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* TAB CATEGORÍAS */}
                {activeTab === 'categories' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                      {categories.map(c => (
                          <div key={c.id} className="flex items-center justify-between p-4 border-b border-white/5 hover:bg-white/5 transition-colors group">
                             <h4 className="font-bold text-white uppercase text-sm">{c.name}</h4>
                             <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button onClick={() => { setEditingCategory(c); setIsCategoryModalOpen(true); }} className="p-2 hover:bg-white hover:text-black text-gray-400 transition-colors" title="Editar"><Edit size={16}/></button>
                             </div>
                          </div>
                      ))}
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
      
      {/* MODALES CONECTADOS CORRECTAMENTE */}
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
    </div>
  );
};

export default AdminDashboard;