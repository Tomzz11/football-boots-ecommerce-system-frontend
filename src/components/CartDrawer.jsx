import { Link } from 'react-router-dom';
import { X, Plus, Minus, ShoppingBag, Trash2, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useCartStore from '../../stores/cartStore';
import { formatPrice, getProductImage } from '../../lib/utils';
import { FREE_SHIPPING_THRESHOLD } from '../../lib/constants';
import Button from '../ui/Button';

export default function CartDrawer() {
  const { 
    items, 
    isOpen, 
    closeCart, 
    removeItem, 
    updateQuantity,
    getCartTotals 
  } = useCartStore();

  const { 
    itemsCount, 
    subtotal, 
    shipping, 
    total,
    freeShippingProgress,
    amountToFreeShipping 
  } = getCartTotals();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary-600" />
                <h2 className="font-display font-semibold text-lg">
                  ตะกร้าสินค้า ({itemsCount})
                </h2>
              </div>
              <button
                onClick={closeCart}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress */}
            {items.length > 0 && amountToFreeShipping > 0 && (
              <div className="p-4 bg-primary-50">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="w-4 h-4 text-primary-600" />
                  <span className="text-sm text-primary-700">
                    ซื้อเพิ่มอีก <strong>{formatPrice(amountToFreeShipping)}</strong> เพื่อรับส่งฟรี!
                  </span>
                </div>
                <div className="h-2 bg-primary-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${freeShippingProgress}%` }}
                    className="h-full bg-primary-600 rounded-full"
                  />
                </div>
              </div>
            )}

            {items.length > 0 && amountToFreeShipping <= 0 && (
              <div className="p-4 bg-green-50 flex items-center gap-2">
                <Truck className="w-5 h-5 text-green-600" />
                <span className="text-green-700 font-medium">
                  🎉 คุณได้รับส่งฟรี!
                </span>
              </div>
            )}

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <ShoppingBag className="w-16 h-16 mb-4 text-gray-300" />
                  <p className="text-lg font-medium">ตะกร้าว่างเปล่า</p>
                  <p className="text-sm">เลือกสินค้าที่ชอบเลย!</p>
                  <Button
                    onClick={closeCart}
                    variant="outline"
                    className="mt-4"
                    as={Link}
                    to="/products"
                  >
                    ไปช้อปปิ้ง
                  </Button>
                </div>
              ) : (
                items.map((item) => (
                  <CartItem
                    key={`${item.product._id}-${item.size}`}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t p-4 space-y-4">
                {/* Summary */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ราคาสินค้า</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ค่าจัดส่ง</span>
                    <span className={shipping === 0 ? 'text-green-600' : ''}>
                      {shipping === 0 ? 'ฟรี' : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                    <span>รวมทั้งหมด</span>
                    <span className="text-primary-600">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Link to="/checkout" onClick={closeCart}>
                    <Button fullWidth size="lg">
                      ดำเนินการสั่งซื้อ
                    </Button>
                  </Link>
                  <button
                    onClick={closeCart}
                    className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
                  >
                    หรือ เลือกซื้อสินค้าเพิ่ม
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Cart Item Component
function CartItem({ item, onUpdateQuantity, onRemove }) {
  const { product, size, quantity } = item;
  const imageUrl = getProductImage(product.images);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex gap-4 bg-gray-50 rounded-xl p-3"
    >
      {/* Image */}
      <Link 
        to={`/products/${product.slug || product._id}`}
        className="w-24 h-24 bg-white rounded-lg overflow-hidden flex-shrink-0"
      >
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link 
          to={`/products/${product.slug || product._id}`}
          className="font-medium text-gray-800 hover:text-primary-600 line-clamp-2"
        >
          {product.name}
        </Link>
        
        <p className="text-sm text-gray-500 mt-1">
          ไซส์: EU {size}
        </p>
        
        <div className="flex items-center justify-between mt-2">
          {/* Quantity */}
          <div className="flex items-center gap-1 bg-white rounded-lg border">
            <button
              onClick={() => onUpdateQuantity(product._id, size, quantity - 1)}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-l-lg"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-medium">{quantity}</span>
            <button
              onClick={() => onUpdateQuantity(product._id, size, quantity + 1)}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-r-lg"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Price */}
          <span className="font-semibold text-primary-600">
            {formatPrice(product.price * quantity)}
          </span>
        </div>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => onRemove(product._id, size)}
        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors self-start"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

