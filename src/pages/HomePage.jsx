import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, CreditCard, Headphones } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFeaturedProducts, useNewArrivals } from '../../hooks/useProducts';
import ProductCard from '../../components/product/ProductCard';
import { ProductGridSkeleton } from '../../components/ui/Loading';
import Button from '../../components/ui/Button';
import { BRANDS } from '../../lib/constants';

export default function HomePage() {
  const { data: featuredProducts, isLoading: loadingFeatured } = useFeaturedProducts(8);
  const { data: newArrivals, isLoading: loadingNew } = useNewArrivals(4);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-primary-900 overflow-hidden">
        <div className="container-custom relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[600px] py-16">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-2 bg-primary-500/20 text-primary-400 rounded-full text-sm font-medium mb-6">
                🔥 คอลเลคชันใหม่ 2024
              </span>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white leading-tight mb-6">
                รองเท้าสตั๊ด
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-green-300"> ระดับโปร</span>
                <br />สำหรับนักเตะตัวจริง
              </h1>
              
              <p className="text-lg text-gray-300 mb-8 max-w-lg">
                เลือกสรรรองเท้าสตั๊ดคุณภาพจากแบรนด์ชั้นนำ Nike, Adidas, Puma 
                ของแท้ 100% พร้อมรับประกันคุณภาพ
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link to="/products">
                  <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                    ช้อปเลย
                  </Button>
                </Link>
                <Link to="/products?isFeatured=true">
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-gray-900">
                    สินค้าแนะนำ
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <img
                src="https://images.unsplash.com/photo-1511886929837-354d827aae26?w=600"
                alt="Football Cleats"
                className="w-full max-w-lg mx-auto drop-shadow-2xl rounded-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-white border-b">
        <div className="container-custom py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: 'ส่งฟรีทั่วไทย', desc: 'เมื่อซื้อครบ ฿2,000' },
              { icon: Shield, title: 'ของแท้ 100%', desc: 'รับประกันคุณภาพ' },
              { icon: CreditCard, title: 'ชำระปลอดภัย', desc: 'หลากหลายช่องทาง' },
              { icon: Headphones, title: 'บริการ 24/7', desc: 'ทีมงานพร้อมช่วยเหลือ' },
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{feature.title}</p>
                  <p className="text-sm text-gray-500">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Logos */}
      <section className="py-12 bg-gray-50">
        <div className="container-custom">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {BRANDS.map((brand) => (
              <Link
                key={brand.value}
                to={`/products?brand=${brand.value}`}
                className="text-2xl font-display font-bold text-gray-400 hover:text-gray-800 transition-colors"
              >
                {brand.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-display font-bold text-gray-800">สินค้าแนะนำ</h2>
              <p className="text-gray-500 mt-2">คัดสรรรองเท้าสตั๊ดยอดนิยมสำหรับคุณ</p>
            </div>
            <Link to="/products?isFeatured=true" className="hidden sm:flex items-center gap-2 text-primary-600 font-medium">
              ดูทั้งหมด <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingFeatured ? (
            <ProductGridSkeleton count={8} />
          ) : (
            <div className="product-grid">
              {featuredProducts?.map((product, index) => (
                <ProductCard key={product._id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-display font-bold text-gray-800">สินค้ามาใหม่</h2>
              <p className="text-gray-500 mt-2">รุ่นล่าสุดที่เพิ่งเข้ามา</p>
            </div>
            <Link to="/products?sort=-createdAt" className="hidden sm:flex items-center gap-2 text-primary-600 font-medium">
              ดูทั้งหมด <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingNew ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals?.map((product, index) => (
                <ProductCard key={product._id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gray-900">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-display font-bold text-white mb-4">รับข่าวสารและส่วนลดพิเศษ</h2>
          <p className="text-gray-400 mb-8">สมัครรับข่าวสารเพื่อรับส่วนลด 10% สำหรับการสั่งซื้อครั้งแรก</p>
          <form className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="กรอกอีเมลของคุณ"
              className="flex-1 px-6 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Button type="submit">สมัครรับข่าวสาร</Button>
          </form>
        </div>
      </section>
    </div>
  );
}


