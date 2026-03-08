import { Link } from 'react-router-dom';
import { ArrowRight, Crown, Star, Zap, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProductsByGrade } from '../hooks/useProducts';
import ProductCard from '../components/product/ProductCard';
import { ProductGridSkeleton } from '../components/ui/Loading';
import { GRADES } from '../lib/constants';

const gradeIcons = {
  Elite: Crown,
  Pro: Star,
  Academy: Zap,
  Club: Users,
};

const gradeColors = {
  Elite: 'from-amber-500 to-yellow-600',
  Pro: 'from-purple-500 to-indigo-600',
  Academy: 'from-blue-500 to-cyan-600',
  Club: 'from-green-500 to-emerald-600',
};

export default function GradeShowcasePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            เลือกเกรดที่ใช่สำหรับคุณ
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            รองเท้าสตั๊ดทุกระดับ ตั้งแต่รุ่นท็อปสำหรับนักเตะมืออาชีพ
            ไปจนถึงรุ่นเริ่มต้นสำหรับนักเตะมือใหม่
          </p>
        </div>
      </section>

      {/* Grade Sections */}
      {GRADES.map((grade, index) => (
        <GradeSection key={grade.value} grade={grade} index={index} />
      ))}
    </div>
  );
}

function GradeSection({ grade, index }) {
  const { data: products, isLoading } = useProductsByGrade(grade.value, 4);
  const Icon = gradeIcons[grade.value];
  const isEven = index % 2 === 0;

  return (
    <section className={`py-16 ${isEven ? 'bg-white' : 'bg-gray-50'}`}>
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Grade Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradeColors[grade.value]} flex items-center justify-center`}>
              <Icon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-800">
                {grade.label}
              </h2>
              <p className="text-gray-500">
                {grade.description} • {grade.priceRange}
              </p>
            </div>
            <Link
              to={`/products?grade=${grade.value}`}
              className="ml-auto hidden sm:flex items-center gap-2 text-primary-600 font-medium hover:underline"
            >
              ดูทั้งหมด <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Products */}
          {isLoading ? (
            <ProductGridSkeleton count={4} />
          ) : products?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, i) => (
                <ProductCard key={product._id} product={product} index={i} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-8">ยังไม่มีสินค้าในเกรดนี้</p>
          )}

          {/* Mobile link */}
          <div className="mt-6 text-center sm:hidden">
            <Link
              to={`/products?grade=${grade.value}`}
              className="text-primary-600 font-medium hover:underline"
            >
              ดูทั้งหมดในเกรด {grade.label} →
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

