import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, ArrowLeft, Minus, Plus, Truck, ShieldCheck, User as UserIcon, Tag, Activity, Wrench } from 'lucide-react';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { reviewService } from '../services/reviewService';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import AlertModal from '../components/ui/AlertModal';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const addToCart = useCartStore(state => state.addToCart);

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  const showAlert = (type, title, message) => {
    setAlertModal({ isOpen: true, type, title, message });
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prodData, categories, reviewData] = await Promise.all([
          productService.getById(id),
          categoryService.getAll(),
          reviewService.getByProduct(id)
        ]);
        
        const category = categories.find(c => c.id === prodData.category_id);
        const productWithCategory = {
          ...prodData,
          category_name: category ? category.name : 'Componentes'
        };
        
        setProduct(productWithCategory);
        setReviews(reviewData);
      } catch (error) { navigate('/'); } finally { setLoading(false); }
    };
    loadData();
  }, [id, navigate]);

  const handleAddToCart = () => { addToCart(product, quantity); navigate('/cart'); };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showAlert('warning', 'Acceso Restringido', 'Debes iniciar sesión para publicar una reseña.');
      return;
    }
    if (newReview.comment.length < 10) {
      showAlert('warning', 'Comentario muy corto', 'Por favor escribe al menos 10 caracteres.');
      return;
    }
    try {
      const created = await reviewService.create({ ...newReview, product_id: parseInt(id), user_id: user.id, user_name: user.name });
      setReviews([...reviews, created]);
      setNewReview({ rating: 5, comment: '' });
      showAlert('success', '¡Gracias!', 'Tu reseña ha sido publicada exitosamente.');
    } catch (error) { 
      console.error(error);
      showAlert('error', 'Error', 'Ocurrió un error al publicar tu reseña.');
    }
  };

  if (loading || !product) return <div className="h-screen flex items-center justify-center bg-[#0f1115] text-brand-accent italic font-black text-xl tracking-widest">CARGANDO TELEMETRÍA...</div>;

  return (
    <div className="min-h-screen bg-[#0f1115] py-8 px-4 sm:px-6 lg:px-8 text-gray-200">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-gray-500 hover:text-brand-accent transition-colors text-xs font-bold uppercase tracking-widest group">
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
            Volver a la Pista
          </Link>
        </div>

        {/* Product Spec Sheet - TARJETA PRINCIPAL OSCURA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#16191e] rounded-sm border border-white/10 shadow-2xl mb-12 overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-2">
            
            {/* IZQUIERDA: Visual Placeholder (Más oscuro) */}
            <div className="bg-[#0a0a0b] border-b md:border-b-0 md:border-r border-white/10 p-12 flex flex-col items-center justify-center relative min-h-[400px]">
               <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 bg-brand-accent text-black px-3 py-1 text-[10px] font-black uppercase tracking-widest transform -skew-x-12">
                    <Tag size={10}/> {product.category_name}
                  </span>
               </div>
               
               {/* Visual Placeholder */}
               <div className="text-[120px] font-black text-white/5 select-none italic tracking-tighter">
                  {product.name.substring(0,2).toUpperCase()}
               </div>
               <div className="mt-8 flex gap-6 text-gray-600">
                 <div className="flex flex-col items-center gap-1"><Activity size={20} className="text-brand-accent/50"/> <span className="text-[10px] uppercase font-bold tracking-widest">Pro Grade</span></div>
                 <div className="flex flex-col items-center gap-1"><Wrench size={20} className="text-brand-accent/50"/> <span className="text-[10px] uppercase font-bold tracking-widest">Service</span></div>
               </div>
            </div>

            {/* DERECHA: Datos Técnicos */}
            <div className="p-6 md:p-8 md:pt-6 flex flex-col">
              <div className="mb-auto">
                <div className="flex items-center justify-between mb-2">
                   <div className="flex items-center gap-1 text-brand-accent">
                     <Star size={14} className="fill-current" />
                     <span className="text-sm font-black italic">{product.rating.toFixed(1)}</span>
                     <span className="text-gray-500 text-[10px] not-italic ml-1 font-mono">REF: {product.id}</span>
                   </div>
                   <span className={`text-[10px] font-bold uppercase px-2 py-1 border ${product.stock > 0 ? 'text-green-400 border-green-400/30 bg-green-400/10' : 'text-red-500 border-red-500/30 bg-red-500/10'}`}>
                      {product.stock > 0 ? 'En Pista' : 'Sin Stock'}
                   </span>
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-white mb-3 italic tracking-tight uppercase leading-none">
                  {product.name}
                </h1>
                
                <p className="text-gray-400 text-sm leading-relaxed font-medium mb-6 line-clamp-3">
                  {product.description || 'Componente de alto rendimiento diseñado para competición y uso intensivo. Fabricado con materiales de primera calidad.'}
                </p>
                
                <div className="w-full h-[1px] bg-white/10 mb-6"></div>
              </div>

              {/* Panel de Compra (Fondo integrado oscuro) */}
              <div className="bg-[#0f1115] p-5 border border-white/5 shadow-inner">
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest block mb-1">Precio Final</span>
                    <span className="text-4xl font-black text-brand-accent tracking-tighter">
                      ${product.price.toLocaleString('es-AR')}
                    </span>
                  </div>
                  <div className="text-right space-y-1">
                     <div className="flex items-center justify-end gap-1 text-[10px] font-bold text-gray-500 uppercase">
                       <Truck size={12}/> Envío Asegurado
                     </div>
                     <div className="flex items-center justify-end gap-1 text-[10px] font-bold text-gray-500 uppercase">
                       <ShieldCheck size={12}/> Garantía Oficial
                     </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center bg-[#16191e] border border-white/10 h-12 w-32">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-colors"><Minus size={16} /></button>
                    <span className="flex-grow text-center font-bold text-white font-mono">{quantity}</span>
                    <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-colors"><Plus size={16} /></button>
                  </div>

                  <button 
                    onClick={handleAddToCart} 
                    disabled={product.stock === 0} 
                    className="flex-grow bg-brand-accent hover:bg-white hover:text-black text-black h-12 px-6 font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform active:scale-[0.98] shadow-glow"
                  >
                    <ShoppingCart size={18} strokeWidth={2.5} /> Agregar al Equipo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Reviews Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 border-t border-white/10 pt-8">
          <div className="lg:col-span-1">
             <h3 className="text-xl font-black uppercase text-white mb-4 flex items-center gap-2 italic">
               <span className="w-1 h-6 bg-brand-accent block transform -skew-x-12"></span> Feedback del Rider
             </h3>
             
             {/* Formulario Oscuro */}
             <div className="bg-[#16191e] p-6 border border-white/10 shadow-sm">
                <h4 className="font-bold text-white text-sm uppercase mb-4 tracking-wider">Dejar Opinión</h4>
                {isAuthenticated ? (
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div className="flex gap-2 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} type="button" onClick={() => setNewReview({...newReview, rating: star})} className="focus:outline-none hover:scale-110 transition-transform">
                          <Star size={20} className={star <= newReview.rating ? "text-brand-accent fill-brand-accent" : "text-gray-700"} />
                        </button>
                      ))}
                    </div>
                    <textarea 
                      required 
                      value={newReview.comment} 
                      onChange={(e) => setNewReview({...newReview, comment: e.target.value})} 
                      rows="3" 
                      className="w-full p-3 text-sm border border-white/10 bg-[#0f1115] text-white focus:border-brand-accent focus:ring-0 outline-none resize-none font-medium placeholder-gray-600" 
                      placeholder="Comparte tu experiencia técnica..."
                    ></textarea>
                    <button type="submit" className="w-full bg-white text-black py-3 font-black uppercase text-xs tracking-widest hover:bg-brand-accent transition-colors">Publicar</button>
                  </form>
                ) : (
                  <div className="text-center py-4 border border-dashed border-white/10 bg-[#0f1115]">
                    <p className="text-gray-500 text-xs mb-2 uppercase tracking-wide">Ingresa para opinar</p>
                    <Link to="/login" className="text-brand-accent font-bold text-xs uppercase hover:underline">Iniciar Sesión</Link>
                  </div>
                )}
             </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {reviews.length > 0 ? reviews.map((review) => (
              <div key={review.id} className="bg-[#16191e] p-6 border border-white/10 hover:border-l-4 hover:border-l-brand-accent transition-all group">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#0f1115] border border-white/10 flex items-center justify-center text-gray-400 font-black text-xs group-hover:text-brand-accent transition-colors">
                      {review.user_name?.charAt(0).toUpperCase() || <UserIcon size={14}/>}
                    </div>
                    <div>
                      <span className="font-bold text-white block text-sm uppercase tracking-wide">{review.user_name}</span>
                      <div className="flex text-brand-accent scale-75 origin-left gap-1">
                        {[...Array(5)].map((_, i) => (<Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} />))}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-gray-600 uppercase">{review.date}</span>
                </div>
                <p className="text-gray-400 text-sm italic pl-11 border-l-2 border-white/5">"{review.comment}"</p>
              </div>
            )) : (
              <div className="py-12 text-center text-gray-600 border border-dashed border-white/10 bg-[#16191e]/50">
                <p className="text-sm font-medium uppercase tracking-widest">Sin registros de actividad.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AlertModal 
        isOpen={alertModal.isOpen} 
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })} 
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  );
};

export default ProductDetail;