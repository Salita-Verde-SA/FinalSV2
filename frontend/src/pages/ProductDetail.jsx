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

  if (loading || !product) return <div className="h-screen flex items-center justify-center bg-surface text-primary italic font-black text-xl">CARGANDO EQUIPO...</div>;

  return (
    <div className="min-h-screen bg-surface py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-text-secondary hover:text-primary transition-colors text-xs font-bold uppercase tracking-wider group">
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
            Volver a la Pista
          </Link>
        </div>

        {/* Product Spec Sheet */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-sm border border-ui-border shadow-sm mb-16 overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-2">
            
            {/* IZQUIERDA: Identidad Visual / Placeholder Técnico */}
            <div className="bg-surface border-b md:border-b-0 md:border-r border-ui-border p-12 flex flex-col items-center justify-center relative min-h-[400px]">
               <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 bg-text-primary text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest transform -skew-x-12">
                    <Tag size={10}/> {product.category_name}
                  </span>
               </div>
               
               {/* Visual Placeholder */}
               <div className="text-[120px] font-black text-ui-border/40 select-none italic">
                  {product.name.substring(0,2).toUpperCase()}
               </div>
               <div className="mt-8 flex gap-4 text-text-muted">
                 <div className="flex flex-col items-center gap-1"><Activity size={20}/> <span className="text-[10px] uppercase font-bold">Pro Grade</span></div>
                 <div className="flex flex-col items-center gap-1"><Wrench size={20}/> <span className="text-[10px] uppercase font-bold">Service</span></div>
               </div>
            </div>

            {/* DERECHA: Datos Técnicos */}
            <div className="p-8 md:p-12 flex flex-col">
              <div className="mb-auto">
                <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-1 text-primary">
                     <Star size={16} className="fill-current" />
                     <span className="text-lg font-black italic">{product.rating.toFixed(1)}</span>
                     <span className="text-text-muted text-xs not-italic ml-1">/ 5.0</span>
                   </div>
                   <span className={`text-[10px] font-bold uppercase px-2 py-1 border ${product.stock > 0 ? 'text-green-600 border-green-600' : 'text-red-500 border-red-500'}`}>
                      {product.stock > 0 ? 'Disponible' : 'Sin Stock'}
                   </span>
                </div>

                <h1 className="text-3xl md:text-4xl font-black text-text-primary mb-4 italic tracking-tight uppercase leading-none">
                  {product.name}
                </h1>
                
                <div className="w-12 h-1 bg-primary mb-6 transform -skew-x-12"></div>

                <p className="text-text-secondary text-sm leading-relaxed font-medium mb-8">
                  {product.description || 'Componente de alto rendimiento diseñado para competición y uso intensivo. Fabricado con materiales de primera calidad para garantizar durabilidad en cualquier terreno.'}
                </p>
              </div>

              {/* Panel de Compra */}
              <div className="bg-surface p-6 border border-ui-border mt-6">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <span className="text-[10px] text-text-muted uppercase font-bold block mb-1">Valor Contado</span>
                    <span className="text-4xl font-black text-text-primary tracking-tighter">
                      ${product.price.toLocaleString('es-AR')}
                    </span>
                  </div>
                  <div className="text-right space-y-1">
                     <div className="flex items-center justify-end gap-1 text-[10px] font-bold text-text-secondary uppercase">
                       <Truck size={12}/> Envío Nacional
                     </div>
                     <div className="flex items-center justify-end gap-1 text-[10px] font-bold text-text-secondary uppercase">
                       <ShieldCheck size={12}/> Garantía Oficial
                     </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center bg-white border border-ui-border h-12 w-32">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-full flex items-center justify-center text-text-secondary hover:text-primary hover:bg-gray-50 transition-colors"><Minus size={16} /></button>
                    <span className="flex-grow text-center font-bold text-text-primary">{quantity}</span>
                    <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="w-10 h-full flex items-center justify-center text-text-secondary hover:text-primary hover:bg-gray-50 transition-colors"><Plus size={16} /></button>
                  </div>

                  <button 
                    onClick={handleAddToCart} 
                    disabled={product.stock === 0} 
                    className="flex-grow bg-primary hover:bg-primary-hover text-white h-12 px-6 font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform active:scale-95 shadow-sm"
                  >
                    <ShoppingCart size={18} /> Agregar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Reviews Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 border-t-2 border-dashed border-ui-border pt-12">
          <div className="lg:col-span-1">
             <h3 className="text-xl font-black uppercase text-text-primary mb-6 flex items-center gap-2 italic">
               <span className="w-1 h-6 bg-primary block transform -skew-x-12"></span> Feedback del Rider
             </h3>
             
             <div className="bg-white p-6 border border-ui-border shadow-sm">
                <h4 className="font-bold text-text-primary text-sm uppercase mb-4">Dejar Opinión</h4>
                {isAuthenticated ? (
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div className="flex gap-2 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} type="button" onClick={() => setNewReview({...newReview, rating: star})} className="focus:outline-none hover:scale-110 transition-transform">
                          <Star size={20} className={star <= newReview.rating ? "text-primary fill-primary" : "text-gray-300"} />
                        </button>
                      ))}
                    </div>
                    <textarea required value={newReview.comment} onChange={(e) => setNewReview({...newReview, comment: e.target.value})} rows="3" className="w-full p-3 text-sm border border-ui-border bg-surface focus:border-primary focus:ring-0 outline-none resize-none font-medium" placeholder="Comparte tu experiencia..."></textarea>
                    <button type="submit" className="w-full bg-text-primary text-white py-3 font-bold uppercase text-xs tracking-widest hover:bg-black transition-colors">Publicar</button>
                  </form>
                ) : (
                  <div className="text-center py-4 border border-dashed border-ui-border bg-surface">
                    <p className="text-text-secondary text-xs mb-2">Ingresa para opinar</p>
                    <Link to="/login" className="text-primary font-bold text-xs uppercase hover:underline">Iniciar Sesión</Link>
                  </div>
                )}
             </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {reviews.length > 0 ? reviews.map((review) => (
              <div key={review.id} className="bg-white p-6 border border-ui-border hover:border-l-4 hover:border-l-primary transition-all">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-surface border border-ui-border flex items-center justify-center text-text-primary font-black text-xs">
                      {review.user_name?.charAt(0).toUpperCase() || <UserIcon size={14}/>}
                    </div>
                    <div>
                      <span className="font-bold text-text-primary block text-sm uppercase">{review.user_name}</span>
                      <div className="flex text-primary scale-75 origin-left gap-1">
                        {[...Array(5)].map((_, i) => (<Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} />))}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-text-muted">{review.date}</span>
                </div>
                <p className="text-text-secondary text-sm italic pl-11">"{review.comment}"</p>
              </div>
            )) : (
              <div className="py-12 text-center text-text-muted border border-dashed border-ui-border bg-surface">
                <p className="text-sm font-medium">Sin registros de actividad.</p>
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