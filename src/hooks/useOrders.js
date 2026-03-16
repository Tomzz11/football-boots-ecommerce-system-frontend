import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import useCartStore from '../stores/cartStore';

// Query keys
export const orderKeys = {
  all: ['orders'],
  lists: () => [...orderKeys.all, 'list'],
  myOrders: (filters) => [...orderKeys.lists(), 'my', filters],
  details: () => [...orderKeys.all, 'detail'],
  detail: (id) => [...orderKeys.details(), id],
};

/**
 * รองรับหลายรูปแบบ response ของ order:
 * - { success: true, data: { order } }
 * - { data: { order } }
 * - { order }
 * - order object ตรง ๆ
 */
function unwrapOrderResponse(response) {
  return response?.data?.order || response?.order || response?.data || response || null;
}

/**
 * Get user's orders
 */
export function useMyOrders(filters = {}) {
  const queryString = new URLSearchParams(filters).toString();

  return useQuery({
    queryKey: orderKeys.myOrders(filters),
    queryFn: async () => {
      const response = await api.get(`/orders/my-orders?${queryString}`);
      return response;
    },
  });
}

/**
 * Get single order by ID
 */
export function useOrder(orderId) {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: async () => {
      const response = await api.get(`/orders/${orderId}`);
      return unwrapOrderResponse(response);
    },
    enabled: !!orderId,
  });
}

/**
 * Create new order
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();
  const clearCart = useCartStore((state) => state.clearCart);

  return useMutation({
    mutationFn: async (orderData) => {
      const response = await api.post('/orders', orderData);
      return unwrapOrderResponse(response);
    },
    onSuccess: (order) => {
      clearCart();
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      toast.success('สร้างออเดอร์สำเร็จ!');
      return order;
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'สร้างออเดอร์ไม่สำเร็จ';
      toast.error(message);
    },
  });
}

/**
 * Pay for order
 */
export function usePayOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, paymentResult }) => {
      const response = await api.put(`/orders/${orderId}/pay`, paymentResult);
      return unwrapOrderResponse(response);
    },
    onSuccess: (order) => {
      if (order?._id) {
        queryClient.invalidateQueries({ queryKey: orderKeys.detail(order._id) });
      }
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      toast.success('ชำระเงินสำเร็จ!');
    },
  });
}

/**
 * Cancel order
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, reason }) => {
      const response = await api.put(`/orders/${orderId}/cancel`, { reason });
      return unwrapOrderResponse(response);
    },
    onSuccess: (order) => {
      if (order?._id) {
        queryClient.invalidateQueries({ queryKey: orderKeys.detail(order._id) });
      }
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      toast.success('ยกเลิกออเดอร์สำเร็จ');
    },
  });
}

/**
 * Check stock availability before checkout
 */
export function useCheckStock() {
  return useMutation({
    mutationFn: async (items) => {
      const response = await api.post('/inventory/check', { items });
      return response?.data || response;
    },
  });
}


