import api from '../config/api';

export const billService = {
  // Obtener todas las facturas
  getAll: async () => {
    const response = await api.get('/bills/');
    return response.data;
  },

  // Obtener facturas del usuario autenticado
  getMyBills: async (clientId) => {
    const response = await api.get('/bills/');
    const orders = await api.get('/orders/');
    
    const clientOrders = orders.data.filter(order => order.client_id === clientId);
    const clientBillIds = clientOrders.map(order => order.bill_id);
    
    return response.data
      .filter(bill => clientBillIds.includes(bill.id_key))
      .map(bill => ({
        id: bill.id_key,
        bill_number: bill.bill_number,
        date: bill.date,
        total: parseFloat(bill.total),
        payment_type: bill.payment_type,
        discount: bill.discount
      }));
  },

  // Obtener factura por ID
  getBillById: async (id) => {
    const response = await api.get(`/bills/${id}/`);
    return response.data;
  },

  // Crear factura - Ajustado para validación estricta
  create: async (billData) => {
    const payload = {
      client_id: Number(billData.client_id),
      total: Number(billData.total),
      // Solo YYYY-MM-DD (fecha pura) para evitar error de Datetime
      date: new Date().toISOString().split('T')[0],
      payment_type: "CREDIT_CARD",
      bill_number: `FAC-${Date.now()}`,
      discount: 0
    };

    const response = await api.post('/bills/', payload);
    return response.data;
  }
};