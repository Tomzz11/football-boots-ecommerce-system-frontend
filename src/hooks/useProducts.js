import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';


// Query keys
export const productKeys = {
    all: ['products'],
    lists: () => [...productKeys.all, 'list'],
    list: (filters) => [...productKeys.list(), filters],
    details: () => [...productKeys.all, 'detail'],
    detail: (id) => [...productKeys.details(), id],
    featured: () => [...productKeys.all, 'featured'],
    newArrivals: () => [...productKeys.all, 'new-arrivals'],
    related: (id) => [...productKeys.all, 'related', id],
};

/**
 * Get all products with filters
 */
export function useProducts(filters = {}) {
  const queryString = new URLSearchParams(filters).toString();
  
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: async () => {
      const response = await api.get(`/products?${queryString}`);
      return response;
    },
  });
}

/**
 * Get single product by ID or slug
 */
export function useProduct(id) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: async () => {
      const response = await api.get(`/products/${id}`);
      return response.data.product;
    },
    enabled: !!id,
  });
}

/**
 * Get featured products
 */
export function useFeaturedProducts(limit = 8) {
  return useQuery({
    queryKey: productKeys.featured(),
    queryFn: async () => {
      const response = await api.get(`/products/featured?limit=${limit}`);
      return response.data.products;
    },
  });
}

/**
 * Get new arrivals
 */
export function useNewArrivals(limit = 8) {
  return useQuery({
    queryKey: productKeys.newArrivals(),
    queryFn: async () => {
      const response = await api.get(`/products/new-arrivals?limit=${limit}`);
      return response.data.products;
    },
  });
}

/**
 * Get related products
 */
export function useRelatedProducts(productId, limit = 4) {
  return useQuery({
    queryKey: productKeys.related(productId),
    queryFn: async () => {
      const response = await api.get(`/products/${productId}/related?limit=${limit}`);
      return response.data.products;
    },
    enabled: !!productId,
  });
}

/**
 * Add product review
 */
export function useAddReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ productId, data }) => {
      const response = await api.post(`/products/${productId}/reviews`, data);
      return response.data;
    },
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
    },
  });
}

/**
 * Search products
 */
export function useSearchProducts(searchTerm) {
  return useQuery({
    queryKey: ['products', 'search', searchTerm],
    queryFn: async () => {
      const response = await api.get(`/products?search=${searchTerm}`);
      return response.data;
    },
    enabled: searchTerm?.length >= 2,
  });
}


