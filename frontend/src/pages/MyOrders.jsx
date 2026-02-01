import React, { useEffect, useState } from 'react';
import { orderService } from '../services/orderService';
import { orderDetailService } from '../services/orderDetailService';
import { useAuthStore } from '../store/useAuthStore';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const { user } = useAuthStore();

  // Diccionarios de Enums para coincidir con backend/models/enums.py
  const STATUS_LABELS = {
    1: { text: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
    2: { text: 'En Preparación', color: 'bg-blue-100 text-blue-800' },
    3: { text: 'Enviado', color: 'bg-purple-100 text-purple-800' },
    4: { text: 'Entregado', color: 'bg-green-100 text-green-800' },
    5: { text: 'Cancelado', color: 'bg-red-100 text-red-800' }
  };

  const DELIVERY_METHODS = {
    1: '🚗 Drive Thru',
    2: '🤝 En Mano',
    3: '🏠 Domicilio'
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (user?.id) {
          const data = await orderService.getMyOrders(user.id);
          // Ordenamos por fecha descendente
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
      alert("No se pudieron cargar los productos del pedido.");
    }
  };

  if (loading) return <div className="p-10 text-center">Cargando historial...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Mis Pedidos</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed">
          <p className="text-gray-500">No tienes pedidos registrados aún.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id_key || order.id} className="bg-white border rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className="text-sm text-gray-400 block font-mono uppercase">Orden #{order.id_key || order.id}</span>
                    <span className="text-lg font-semibold">{new Date(order.date).toLocaleDateString()}</span>
                  </div>
                  <span className={`px-4 py-1 rounded-full text-xs font-bold ${STATUS_LABELS[order.status]?.color}`}>
                    {STATUS_LABELS[order.status]?.text}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-gray-50">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Entrega</p>
                    <p className="text-sm font-medium">{DELIVERY_METHODS[order.delivery_method]}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase">Total</p>
                    <p className="text-xl font-bold text-blue-600">${parseFloat(order.total).toFixed(2)}</p>
                  </div>
                </div>

                <button 
                  onClick={() => handleSeeDetails(order.id_key || order.id)}
                  className="w-full mt-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Ver productos del pedido
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal simple de detalles */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Productos en el pedido</h2>
            <div className="space-y-3 max-h-60 overflow-y-auto mb-6">
              {selectedOrderDetails.map((item, index) => (
                <div key={index} className="flex justify-between text-sm border-b pb-2">
                  <span>Cant: {item.quantity} - Producto ID: {item.product_id}</span>
                  <span className="font-semibold">${item.unit_price} c/u</span>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setSelectedOrderDetails(null)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;