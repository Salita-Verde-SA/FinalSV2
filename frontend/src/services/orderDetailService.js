import api from '../config/api';

export const orderDetailService = {
  /**
   * Crea un detalle de orden en el backend.
   * CORRECCIÓN: El campo debe llamarse 'price' para coincidir con el schema del backend.
   */
  create: async (detailData) => {
    const payload = {
      order_id: parseInt(detailData.order_id),
      product_id: parseInt(detailData.product_id),
      quantity: parseInt(detailData.quantity),
      price: parseFloat(detailData.price) // Cambiado de unit_price a price
    };
    const response = await api.post('/order_details/', payload);
    return response.data;
  },

  /**
   * Obtiene todos los detalles de una orden específica.
   */
  getByOrderId: async (orderId) => {
    const response = await api.get('/order_details/');
    return response.data.filter(detail => detail.order_id === orderId);
  }
};