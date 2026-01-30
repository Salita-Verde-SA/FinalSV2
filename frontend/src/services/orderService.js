import api from '../config/api';

export const orderService = {
  // Obtener todas las órdenes
  getAll: async () => {
    const response = await api.get('/orders/');
    return response.data;
  },

  // Obtener pedidos del cliente autenticado
  getMyOrders: async (clientId) => {
    const response = await api.get('/orders/');
    return response.data
      .filter(order => order.client_id === clientId)
      .map(order => ({
        id: order.id_key,
        date: order.date,
        total: parseFloat(order.total),
        status: order.status,
        delivery_method: order.delivery_method,
        client_id: order.client_id,
        bill_id: order.bill_id
      }));
  },

  // Obtener orden por ID
  getById: async (id) => {
    const response = await api.get(`/orders/${id}/`);
    return response.data;
  },

  // Crear orden - Corrigiendo error de rango (1, 2, 3, 4 o 5)
  createOrder: async (orderData) => {
  const payload = {
    // Enviamos solo la fecha (YYYY-MM-DD) para cumplir con el error de "zero time"
    date: new Date().toISOString().split('T')[0],
    total: Number(orderData.total),
    client_id: Number(orderData.client_id),
    address_id: Number(orderData.address_id),
    // Forzamos valores que sabemos que están en el rango 1-5
    status: 1, 
    delivery_method: 1,
    bill_id: orderData.bill_id ? Number(orderData.bill_id) : null
  };
  
  const response = await api.post('/orders/', payload);
  return response.data;
},
  // Actualizar estado
  updateStatus: async (id, status) => {
    const order = await orderService.getById(id);
    const response = await api.put(`/orders/${id}/`, {
      ...order,
      status: Number(status)
    });
    return response.data;
  }
};