import { useState, useEffect, useCallback } from 'react';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';

export const useShopData = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Ejecutamos ambas peticiones en paralelo
      const [prodData, catData] = await Promise.all([
        productService.getAll(),
        categoryService.getAll()
      ]);

      // Combinamos productos con los nombres de sus categorías
      const productsWithCategories = prodData.map(product => {
        const category = catData.find(c => c.id === product.category_id);
        return { ...product, category_name: category ? category.name : 'Componentes' };
      });

      setProducts(productsWithCategories);
      setCategories(catData);
    } catch (err) {
      console.error("Error crítico cargando datos de la tienda:", err);
      setError("No pudimos conectar con el servidor de carrera. Verifica tu conexión.");
    } finally {
      setLoading(false);
    }
  }, []); // useCallback asegura que esta función no se recree en cada render

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { products, categories, loading, error, refetch: fetchData };
};