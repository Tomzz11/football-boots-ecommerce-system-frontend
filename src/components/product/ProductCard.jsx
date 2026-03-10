import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn, formatPrice, getProductImage, isInStock, getSizeRange } from '../../lib/utils';
import GradeBadge from './GradeBadge';

export default function ProductCard({ product, index = 0 }) {
  const {
    _id,
    slug,
    name,
    brand,
    grade,
    price,
    comparePrice,
    images,
    sizes,
    rating,
    numReviews,
    isFeatured,
  } = product;

  const imageUrl = getProductImage(images);
  const inStock = isInStock(sizes);
  const sizeRange = getSizeRange(sizes);
  const hasDiscount = comparePrice && comparePrice > price;
  const discountPercent = hasDiscount 
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link 
        to={`/products/${slug || _id}`}
        className="group block"
      >
        <div className="card-hover overflow-hidden">
          {/* Image Container */}
          <div className="relative aspect-square bg-gray-100 overflow-hidden">
            {/* Product Image */}
            <img
              src={imageUrl}
              alt={name}
              className={cn(
                'w-full h-full object-cover transition-transform duration-500',
                'group-hover:scale-110',
                !inStock && 'grayscale opacity-70'
              )}
              loading="lazy"
            />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {hasDiscount && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  -{discountPercent}%
                </span>
              )}
              {isFeatured && (
                <span className="bg-accent-gold text-black text-xs font-bold px-2 py-1 rounded">
                  แนะนำ
                </span>
              )}
              {!inStock && (
                <span className="bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded">
                  สินค้าหมด
                </span>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="p-4">
            {/* Brand */}
            <div className="flex items-center gap-2 mt-1">
            <p className="text-xs font-semibold text-primary-600 uppercase tracking-wider">
              {brand}
            </p>
              <GradeBadge grade={grade} />
            </div>

            {/* Name */}
            <h3 className="mt-1 font-medium text-gray-800 line-clamp-2 group-hover:text-primary-600 transition-colors">
              {name}
            </h3>

            {/* Size Range */}
            <p className="mt-1 text-sm text-gray-500">
              ปุ่ม: {product.studType}
            </p>

            {/* Rating */}
            {numReviews > 0 && (
              <div className="mt-2 flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{rating?.toFixed(1)}</span>
                <span className="text-sm text-gray-400">({numReviews})</span>
              </div>
            )}

            {/* Price */}
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(price)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(comparePrice)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}


