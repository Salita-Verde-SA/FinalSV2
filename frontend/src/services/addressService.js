import api from '../config/api';

export const addressService = {
  // Obtener todas las direcciones
  getAll: async () => {
    const response = await api.get('/addresses/');
    return response.data;
  },

  // Obtener direcciones de un cliente
  getMyAddresses: async (clientId) => {
    const response = await api.get('/addresses/');
    // Filtrar por client_id en el frontend si el backend no soporta filtrado
    return response.data.filter(addr => addr.client_id === clientId);
  },

  // Obtener por ID (CORREGIDO: Sin barra final)
  getById: async (id) => {
    const response = await api.get(`/addresses/${id}`);
    return response.data;
  },

  // Crear dirección
  create: async (addressData) => {
  const payload = {
    street: String(addressData.street),
    number: String(addressData.number),
    city: String(addressData.city),
    client_id: Number(addressData.client_id) // Forzar a número
  };
  const response = await api.post('/addresses/', payload);
  return response.data;
},

// Actualizar dirección (CORREGIDO)
update: async (id, addressData) => {
  const payload = {
    street: String(addressData.street).trim(),
    number: String(addressData.number || '').trim(),
    city: String(addressData.city).trim(), // Se agregó la coma faltante aquí
    client_id: Number(addressData.client_id)
  };

  // Asegúrate de usar el ID correcto en la URL
  const response = await api.put(`/addresses/${id}`, payload);
  return response.data;
},
  // Eliminar dirección (CORREGIDO: Sin barra final)
  delete: async (id) => {
    await api.delete(`/addresses/${id}`);
    return true;
  }
};