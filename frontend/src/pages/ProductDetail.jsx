// Ubicación: frontend/src/pages/ProductDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Truck, Shield } from 'lucide-react';
import { productService } from '../services/productService';
import { useCartStore } from '../store/useCartStore';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const addToCart = useCartStore(state => state.addToCart);

  useEffect(() => {
    productService.getById(id).then(setProduct).catch(console.error);
  }, [id]);

  if (!product) return <div className="min-h-screen flex items-center justify-center font-bold uppercase tracking-widest">Cargando prenda...</div>;

  return (
    <div className="min-h-screen bg-white pt-24 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors mb-8 uppercase text-xs font-bold tracking-widest">
          <ArrowLeft size={16} /> Volver a la colección
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
          <div className="bg-gray-50 aspect-[3/4] overflow-hidden">
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          </div>

          <div className="flex flex-col">
            <span className="text-gray-400 uppercase text-xs font-bold tracking-[0.3em] mb-2">{product.category_name}</span>
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-4 text-black">{product.name}</h1>
            <p className="text-2xl font-light text-gray-900 mb-8">${product.price}</p>
            
            <div className="border-t border-b border-gray-100 py-6 mb-8">
              <p className="text-gray-600 leading-relaxed mb-6">{product.description || "Diseño exclusivo de la línea UrbanStyle."}</p>
              <div className="flex items-center gap-3 text-xs uppercase font-bold tracking-wider text-gray-500">
                 <div className="w-2 h-2 rounded-full bg-green-500"></div> Stock: {product.stock} unidades
              </div>
            </div>

            <button 
              onClick={() => addToCart(product)}
              className="w-full bg-black text-white py-5 flex items-center justify-center gap-3 font-bold uppercase text-sm tracking-[0.2em] hover:bg-gray-800 transition-all mb-8"
            >
              <ShoppingBag size={20} /> Añadir a la bolsa
            </button>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 text-center flex flex-col items-center gap-2">
                <Truck size={18} />
                <p className="text-[10px] uppercase font-bold tracking-widest text-black">Envío Gratis</p>
              </div>
              <div className="p-4 bg-gray-50 text-center flex flex-col items-center gap-2">
                <Shield size={18} />
                <p className="text-[10px] uppercase font-bold tracking-widest text-black">Garantía</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;