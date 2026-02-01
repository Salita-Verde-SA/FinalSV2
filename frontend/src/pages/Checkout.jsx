import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore'; 
import { useAuthStore } from '../store/useAuthStore'; 
import { orderService } from '../services/orderService'; // Usa createOrder
import { billService } from '../services/billService'; // Usa create
import { orderDetailService } from '../services/orderDetailService'; // Usa create
import { addressService } from '../services/addressService'; // Usa create, getMyAddresses y delete

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getTotalPrice, clearCart } = useCartStore(); 
  const { user } = useAuthStore(); 
  
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('new');
  
  const [formData, setFormData] = useState({
    delivery_method: 3, // Domicilio fijo
    payment_type: 2,    // Tarjeta de Débito fija
    street: '',
    number: '',
    city: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  // Carga inicial de direcciones del usuario
  const fetchAddresses = async () => {
    if (user?.id_key) {
      try {
        const data = await addressService.getMyAddresses(user.id_key);
        setAddresses(data);
        if (data.length > 0) setSelectedAddressId(data[0].id_key);
      } catch (error) {
        console.error("Error al cargar direcciones:", error);
      }
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  // Eliminar dirección guardada
  const handleDeleteAddress = async (e, addressId) => {
    e.stopPropagation();
    if (!window.confirm("¿Eliminar esta dirección?")) return;
    try {
      await addressService.delete(addressId);
      setAddresses(addresses.filter(a => a.id_key !== addressId));
      if (selectedAddressId === addressId) setSelectedAddressId('new');
    } catch (error) {
      alert("Error al eliminar la dirección.");
    }
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); 
    const formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setFormData({ ...formData, cardNumber: formattedValue });
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) value = value.substring(0, 2) + '/' + value.substring(2, 4);
    setFormData({ ...formData, expiry: value });
  };

  const handleProcessOrder = async (e) => {
    e.preventDefault();
    
    if (!user || !user.id_key) return alert("Sesión inválida.");
    if (cart.length === 0) return alert("El carrito está vacío.");

    // Validación de dirección nueva
    if (selectedAddressId === 'new' && (!formData.street || !formData.city)) {
      return alert("Por favor, completa los datos de la nueva dirección.");
    }
    
    // Validación de tarjeta
    if (formData.cardNumber.replace(/\s/g, '').length < 16) {
      return alert("Ingresa una tarjeta de débito válida.");
    }

    setLoading(true);

    try {
      const total = getTotalPrice(); 

      // 1. Gestionar Dirección: Crear si es nueva
      if (selectedAddressId === 'new') {
        await addressService.create({
          street: formData.street,
          number: formData.number,
          city: formData.city,
          client_id: user.id_key 
        });
      }

      // 2. Crear Factura
      const createdBill = await billService.create({
        bill_number: `FAC-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        total: parseFloat(total),
        payment_type: 2, 
        client_id: user.id_key, 
        discount: 0
      });

      // 3. Crear Orden
      const createdOrder = await orderService.createOrder({
        total: parseFloat(total),
        delivery_method: 3, 
        status: 1, 
        client_id: user.id_key, 
        bill_id: createdBill.id_key 
      });

      // 4. Registrar Detalles: Se usa 'price' para evitar error 500
      for (const item of cart) {
        await orderDetailService.create({
          order_id: createdOrder.id_key,
          product_id: item.id_key || item.id, 
          quantity: item.quantity,
          price: item.price // Sincronizado con el backend
        });
      }
      
      clearCart(); 
      alert('¡Compra realizada con éxito!');
      navigate('/profile'); 
      
    } catch (error) {
      console.error("Error en checkout:", error);
      alert(error.response?.data?.detail || "Error al procesar la compra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Finalizar Pedido</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Dirección de Envío (A Domicilio)</h2>
            
            {addresses.length > 0 && (
              <div className="mb-6 space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Selecciona una dirección:</label>
                {addresses.map(addr => (
                  <div 
                    key={addr.id_key}
                    onClick={() => setSelectedAddressId(addr.id_key)}
                    className={`flex justify-between items-center p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedAddressId === addr.id_key ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <p className="text-sm">{addr.street} {addr.number}, {addr.city}</p>
                    <button 
                      onClick={(e) => handleDeleteAddress(e, addr.id_key)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => setSelectedAddressId('new')}
                  className={`mt-2 text-sm font-medium ${selectedAddressId === 'new' ? 'text-blue-600' : 'text-gray-500'}`}
                >
                  + Usar una nueva dirección
                </button>
              </div>
            )}

            {(selectedAddressId === 'new' || addresses.length === 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in bg-gray-50 p-4 rounded-lg">
                <input 
                  type="text" placeholder="Calle" className="p-2 border rounded bg-white"
                  maxLength={200} value={formData.street} 
                  onChange={e => setFormData({...formData, street: e.target.value})}
                />
                <input 
                  type="text" placeholder="Número / Depto" className="p-2 border rounded bg-white"
                  maxLength={20} value={formData.number} 
                  onChange={e => setFormData({...formData, number: e.target.value})}
                />
                <input 
                  type="text" placeholder="Ciudad" className="p-2 border rounded md:col-span-2 bg-white"
                  maxLength={100} value={formData.city} 
                  onChange={e => setFormData({...formData, city: e.target.value})}
                />
              </div>
            )}
          </section>

          <section className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Pago con Tarjeta de Débito</h2>
            <div className="space-y-4">
              <input 
                type="text" placeholder="0000 0000 0000 0000" className="w-full p-2 border rounded"
                maxLength={19} value={formData.cardNumber}
                onChange={handleCardNumberChange}
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="text" placeholder="MM/AA" className="p-2 border rounded"
                  maxLength={5} value={formData.expiry}
                  onChange={handleExpiryChange}
                />
                <input 
                  type="password" placeholder="CVV" className="p-2 border rounded"
                  maxLength={4} value={formData.cvv}
                  onChange={e => setFormData({...formData, cvv: e.target.value.replace(/\D/g, '')})}
                />
              </div>
            </div>
          </section>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl border h-fit sticky top-4">
          <h2 className="text-xl font-bold mb-4">Resumen</h2>
          <div className="border-t pt-4">
            <div className="flex justify-between text-2xl font-bold text-blue-700">
              <span>Total</span>
              <span>${getTotalPrice().toFixed(2)}</span>
            </div>
          </div>
          <button 
            onClick={handleProcessOrder}
            disabled={loading || cart.length === 0}
            className="w-full mt-6 bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Procesando...' : 'Confirmar y Pagar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;