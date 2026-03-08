import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Star, Heart, ShoppingCart, Truck, Shield, 
  ChevronLeft, ChevronRight, Minus, Plus, Check 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useProduct, useRelatedProducts } from '../../hooks/useProducts';
import useCartStore from '../../stores/cartStore';
import ProductCard from '../../components/product/ProductCard';
import Button from '../../components/ui/Button';
import { SectionLoading, ProductGridSkeleton } from '../../components/ui/Loading';
import { formatPrice, cn } from '../../lib/utils';
import GradeBadge from '../components/product/GradeBadge';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { data: product, isLoading, error } = useProduct(id);
  const { data: relatedProducts } = useRelatedProducts(id);
  
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  
  const { addItem, isInCart } = useCartStore();

  if (isLoading) return <SectionLoading />;
  if (error || !product) {
    return (
      <div className="container-custom py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">ไม่พบสินค้า</h2>
        <Link to="/products">
          <Button>กลับไปหน้าสินค้า</Button>
        </Link>
      </div>
    );
  }

  const {
    name,
    brand,
    grade,
    price,
    comparePrice,
    description,
    images = [],
    sizes = [],
    rating,
    numReviews,
    reviews = [],
    studType,
    category,
  } = product;

  const hasDiscount = comparePrice && comparePrice > price;
  const discountPercent = hasDiscount 
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : 0;

  const selectedSizeData = sizes.find(s => s.size === selectedSize);
  const isOutOfStock = !selectedSizeData || selectedSizeData.stock === 0;
  const maxQuantity = selectedSizeData?.stock || 1;

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('กรุณาเลือกไซส์');
      return;
    }
    addItem(product, selectedSize, quantity);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container-custom py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-primary-600">หน้าแรก</Link>
            <span className="text-gray-300">/</span>
            <Link to="/products" className="text-gray-500 hover:text-primary-600">สินค้า</Link>
            <span className="text-gray-300">/</span>
            <Link to={`/products?brand=${brand}`} className="text-gray-500 hover:text-primary-600">{brand}</Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-800 font-medium truncate">{name}</span>
          </nav>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <motion.div 
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-square bg-white rounded-2xl overflow-hidden relative"
            >
              <img
                src={images[selectedImage]?.url || 'https://via.placeholder.com/600'}
                alt={name}
                className="w-full h-full object-cover"
              />
              
              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(i => i === 0 ? images.length - 1 : i - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-lg hover:bg-white"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImage(i => i === images.length - 1 ? 0 : i + 1)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-lg hover:bg-white"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Badges */}
              {hasDiscount && (
                <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded">
                  -{discountPercent}%
                </span>
              )}
            </motion.div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      'w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all',
                      selectedImage === index ? 'border-primary-600' : 'border-transparent'
                    )}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {/* Brand & Name */}
            <p className="text-primary-600 font-semibold uppercase tracking-wider">{brand}</p>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-gray-800 mt-2">
              {name}
            </h1>

            {/* Rating */}
            {numReviews > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        'w-5 h-5',
                        star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      )}
                    />
                  ))}
                </div>
                <span className="font-medium">{rating?.toFixed(1)}</span>
                <span className="text-gray-400">({numReviews} รีวิว)</span>
              </div>
            )}

            {/* Price */}
            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary-600">
                {formatPrice(price)}
              </span>
              {hasDiscount && (
                <span className="text-xl text-gray-400 line-through">
                  {formatPrice(comparePrice)}
                </span>
              )}
            </div>

            {/* Tags */}
            <div className="flex gap-2 mt-4">
              <GradeBadge grade={grade} size="md" />
              <span className="badge badge-info">{studType}</span>
              <span className="badge badge-success">{category}</span>
            </div>

            {/* Size Selection */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-800">เลือกไซส์ (CM)</span>
                <Link to="/help/size-guide" className="text-sm text-primary-600 hover:underline">
                  คู่มือไซส์
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((sizeObj) => {
                  const isAvailable = sizeObj.stock > 0;
                  const isSelected = selectedSize === sizeObj.size;
                  
                  return (
                    <button
                      key={sizeObj.size}
                      onClick={() => isAvailable && setSelectedSize(sizeObj.size)}
                      disabled={!isAvailable}
                      className={cn(
                        'w-14 h-12 rounded-lg font-medium transition-all',
                        isAvailable
                          ? isSelected
                            ? 'bg-primary-600 text-white ring-2 ring-primary-600 ring-offset-2'
                            : 'bg-white border-2 border-gray-200 hover:border-primary-600'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed line-through'
                      )}
                    >
                      {sizeObj.size}
                    </button>
                  );
                })}
              </div>
              {selectedSizeData && (
                <p className="text-sm text-gray-500 mt-2">
                  เหลือ {selectedSizeData.stock} คู่
                </p>
              )}
            </div>

            {/* Quantity */}
            <div className="mt-6">
              <span className="font-medium text-gray-800 block mb-3">จำนวน</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 rounded-lg">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-gray-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(maxQuantity, q + 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-gray-500">
                  (มีสินค้า {maxQuantity} คู่)
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-8">
              <Button
                size="lg"
                fullWidth
                onClick={handleAddToCart}
                disabled={!selectedSize || isOutOfStock}
                leftIcon={<ShoppingCart className="w-5 h-5" />}
              >
                {isOutOfStock ? 'สินค้าหมด' : 'เพิ่มลงตะกร้า'}
              </Button>
              <Button size="lg" variant="outline" className="flex-shrink-0">
                <Heart className="w-5 h-5" />
              </Button>
            </div>

            {/* Features */}
            <div className="mt-8 p-6 bg-white rounded-xl space-y-4">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-primary-600" />
                <span className="text-gray-700">ส่งฟรีเมื่อซื้อครบ ฿2,000</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary-600" />
                <span className="text-gray-700">รับประกันของแท้ 100%</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-primary-600" />
                <span className="text-gray-700">เปลี่ยนคืนได้ภายใน 7 วัน</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-12 bg-white rounded-xl p-8">
          <h2 className="text-xl font-display font-bold text-gray-800 mb-4">รายละเอียดสินค้า</h2>
          <div className="prose max-w-none text-gray-600">
            {description || 'ไม่มีรายละเอียด'}
          </div>
        </div>

        {/* Reviews */}
        {reviews.length > 0 && (
          <div className="mt-12 bg-white rounded-xl p-8">
            <h2 className="text-xl font-display font-bold text-gray-800 mb-6">
              รีวิวจากลูกค้า ({numReviews})
            </h2>
            <div className="space-y-6">
              {reviews.slice(0, 5).map((review, index) => (
                <div key={index} className="border-b pb-6 last:border-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-semibold">
                      {review.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{review.name}</p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              'w-4 h-4',
                              star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts?.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-display font-bold text-gray-800 mb-6">
              สินค้าที่เกี่ยวข้อง
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product, index) => (
                <ProductCard key={product._id} product={product} index={index} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}




