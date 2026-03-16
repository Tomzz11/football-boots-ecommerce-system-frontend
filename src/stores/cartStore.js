import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from '../lib/constants';

const useCartStore = create(
  persist(
    (set, get) => ({
      // state
      items: [],
      isOpen: false,
      ownerId: null,

      // Cart owner sync
      syncCartOwner: (userId) => {
        const normalizedUserId = userId || null;
        const { ownerId } = get();

        // logout หรือไม่มี owner
        if (!normalizedUserId) {
          set({ items: [], isOpen: false, ownerId: null });
          return;
        }

        // cart ยังไม่มี owner -> assign ให้ user นี้
        if (!ownerId) {
          set({ ownerId: normalizedUserId });
          return;
        }

        // สลับบัญชี -> ล้าง cart
        if (ownerId !== normalizedUserId) {
          set({
            items: [],
            isOpen: false,
            ownerId: normalizedUserId,
          });
          toast('รีเซ็ตตะกร้าสำหรับบัญชีใหม่แล้ว');
        }
      },

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      addItem: (product, size, quantity = 1) => {
        const { items } = get();

        const existingIndex = items.findIndex(
          (item) => item.product._id === product._id && item.size === size
        );

        if (existingIndex > -1) {
          const newItems = [...items];
          const newQty = newItems[existingIndex].quantity + quantity;

          const sizeData = product.sizes.find((s) => s.size === size);
          if (sizeData && newQty > sizeData.stock) {
            toast.error(`สต็อกมีเพียง ${sizeData.stock} คู่`);
            return false;
          }

          newItems[existingIndex].quantity = newQty;
          set({ items: newItems });
          toast.success('เพิ่มจำนวนในตะกร้าแล้ว');
        } else {
          const newItem = {
            product,
            size,
            quantity,
            addedAt: new Date().toISOString(),
          };

          set({ items: [...items, newItem] });
          toast.success('เพิ่มสินค้าลงตะกร้าแล้ว');
        }

        return true;
      },

      removeItem: (productId, size) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.product._id === productId && item.size === size)
          ),
        }));
        toast.success('ลบออกจากตะกร้าแล้ว');
      },

      updateQuantity: (productId, size, quantity) => {
        if (quantity < 1) {
          get().removeItem(productId, size);
          return;
        }

        set((state) => ({
          items: state.items.map((item) => {
            if (item.product._id === productId && item.size === size) {
              const sizeData = item.product.sizes.find((s) => s.size === size);
              if (sizeData && quantity > sizeData.stock) {
                toast.error(`สต็อกมีเพียง ${sizeData.stock} คู่`);
                return item;
              }
              return { ...item, quantity };
            }
            return item;
          }),
        }));
      },

      clearCart: () => {
        set({ items: [], isOpen: false });
      },

      getCartTotals: () => {
        const { items } = get();

        const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
        const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
        const total = subtotal + shipping;

        return {
          itemsCount,
          subtotal,
          shipping,
          total,
          freeShippingProgress: Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100),
          amountToFreeShipping: Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0),
        };
      },

      isInCart: (productId, size) => {
        return get().items.some(
          (item) => item.product._id === productId && item.size === size
        );
      },

      getItemQuantity: (productId, size) => {
        const item = get().items.find(
          (item) => item.product._id === productId && item.size === size
        );
        return item?.quantity || 0;
      },

      getCheckoutItems: () => {
        return get().items.map((item) => ({
          product: item.product._id,
          size: item.size,
          qty: item.quantity,
        }));
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        ownerId: state.ownerId,
      }),
    }
  )
);

export default useCartStore;

