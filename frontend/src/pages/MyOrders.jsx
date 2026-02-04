import React, { useEffect, useState } from 'react';
import { orderService } from '../services/orderService';
import { orderDetailService } from '../services/orderDetailService';
import { useAuthStore } from '../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Calendar, MapPin, CreditCard, ChevronRight, X, Loader2, Bike } from 'lucide-react';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const { user } = useAuthStore();

  const STATUS_LABELS = {
    1: { text: 'PENDING_REVIEW', color: 'border-yellow-500 text-yellow-500 bg-yellow-500/10' },
    2: { text: 'IN_PREPARATION', color: 'border-blue-500 text-blue-500 bg-blue-500/10' },
    3: { text: 'SHIPPED_OUT', color: 'border-purple-500 text-purple-500 bg-purple-500/10' },
    4: { text: 'DELIVERED_OK', color: 'border-green-500 text-green-500 bg-green-500/10' },
    5: { text: 'ORDER_CANCELLED', color: 'border-red-500 text-red-500 bg-red-500/10' }
  };

  const DELIVERY_METHODS = {
    1: '🚗 DRIVE_THRU_PICKUP',
    2: '🤝 IN_HAND_DELIVERY',
    3: '🏠 HOME_ADDRESS_DROP'
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (user?.id) {
          const data = await orderService.getMyOrders(user.id);
          setOrders(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
        }
      } catch (error) {
        console.error("Error al cargar pedidos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const handleSeeDetails = async (orderId) => {
    try {
      const details = await orderDetailService.getByOrderId(orderId);
      setSelectedOrderDetails(details);
    } catch (error) {
      alert("CRITICAL_ERROR: PRODUCT_DATA_LINK_FAILURE");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0f1115] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
      <span className="text-[10px] font-black text-white/40 tracking-[0.3em] uppercase">Syc_User_History...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f1115] text-white py-12 px-4 relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <header className="mb-12 border-l-4 border-primary pl-6">
          <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
            RIDER<span className="text-primary not-italic">_HISTORY</span>
          </h1>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.4em] mt-2">
            Registro total de operaciones // {orders.length} Pedidos
          </p>
        </header>
        
        {orders.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-[#16191e] border-2 border-dashed border-white/10"
          >
            <Bike className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <p className="text-white/30 font-black uppercase tracking-widest text-sm">No_Records_Found_In_Database</p>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <motion.div 
                key={order.id_key || order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="group relative"
              >
                {/* Neobrutalist Card */}
                <div className="absolute inset-0 bg-primary translate-x-2 translate-y-2 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform duration-300"></div>
                <div className="relative bg-[#1a1d23] border border-white/10 p-6 md:p-8">
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Package size={14} className="text-primary" />
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest font-mono">
                          OP_ID: {order.id_key || order.id}
                        </span>
                      </div>
                      <h3 className="text-2xl font-black uppercase italic italic flex items-center gap-3">
                        <Calendar size={20} className="text-white/20 not-italic" />
                        {new Date(order.date).toLocaleDateString()}
                      </h3>
                    </div>
                    <span className={`px-4 py-2 border-2 font-black text-[10px] uppercase tracking-[0.2em] ${STATUS_LABELS[order.status]?.color || 'border-white/20'}`}>
                      {STATUS_LABELS[order.status]?.text || 'UNKNOWN_STATE'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 border-y border-white/5">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/5 flex items-center justify-center">
                          <MapPin size={18} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Logistic_Method</p>
                          <p className="text-xs font-bold uppercase">{DELIVERY_METHODS[order.delivery_method]}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:text-right flex md:flex-col justify-between md:justify-center items-center md:items-end">
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-widest md:mb-1">Total_Balance</p>
                      <p className="text-4xl font-black text-primary italic leading-none">
                        ${parseFloat(order.total).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleSeeDetails(order.id_key || order.id)}
                    className="w-full mt-6 py-4 bg-white/5 hover:bg-white text-white hover:text-black text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2 group/btn border border-white/10 hover:border-white"
                  >
                    Fetch_Order_Components <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform"/>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal - Brutalist Style */}
      <AnimatePresence>
        {selectedOrderDetails && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[100]">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedOrderDetails(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-[#1a1d23] border border-white/20 w-full max-w-lg relative overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-primary p-4 flex justify-between items-center">
                <h2 className="text-black font-black uppercase italic tracking-tighter">DATA_FETCH_COMPONENTS</h2>
                <button onClick={() => setSelectedOrderDetails(null)} className="text-black hover:rotate-90 transition-transform">
                  <X size={24} />
                </button>
              </div>

              <div className="p-8">
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar mb-8">
                  {selectedOrderDetails.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-4">
                         <div className="w-8 h-8 flex items-center justify-center bg-white/10 text-[10px] font-black italic">
                            x{item.quantity}
                         </div>
                         <div>
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">PRODUCT_ID: {item.product_id}</p>
                            <p className="text-sm font-bold uppercase tracking-tight text-white/90 italic">Unidad: ${item.unit_price}</p>
                         </div>
                      </div>
                      <div className="text-right font-mono text-primary font-bold">
                        ${(item.quantity * item.unit_price).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => setSelectedOrderDetails(null)}
                  className="w-full bg-white text-black py-4 font-black uppercase italic tracking-[0.3em] hover:bg-primary transition-colors shadow-[4px_4px_0px_rgba(255,255,255,0.2)]"
                >
                  Close_Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyOrders;