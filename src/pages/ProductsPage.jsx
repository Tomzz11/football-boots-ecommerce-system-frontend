import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/product/ProductCard';
import { ProductGridSkeleton } from '../components/ui/Loading';
import Button from '../components/ui/Button';
import { BRANDS, GRADES, STUD_TYPES, CATEGORIES, SORT_OPTIONS, PRICE_RANGES } from '../lib/constants';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Get filters from URL
  const filters = {
    page: searchParams.get('page') || 1,
    limit: 12,
    search: searchParams.get('search') || '',
    brand: searchParams.get('brand') || '',
    grade: searchParams.get('grade') || '',
    studType: searchParams.get('studType') || '',
    category: searchParams.get('category') || '',
    sort: searchParams.get('sort') || '-createdAt',
    minPrice: searchParams.get('priceMin') || '',
    maxPrice: searchParams.get('priceMax') || '',
    isFeatured: searchParams.get('isFeatured') || '',
  };

  // Remove empty filters
  Object.keys(filters).forEach(key => {
    if (!filters[key]) delete filters[key];
  });

  const { data, isLoading, error } = useProducts(filters);
  const products = data?.data || [];
  const pagination = data?.pagination || {};

  // Update URL params
  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.delete('page'); // Reset page when filter changes
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const activeFiltersCount = [
    searchParams.get('brand'),
    searchParams.get('studType'),
    searchParams.get('category'),
    searchParams.get('grade'),
    searchParams.get('priceMin'),
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container-custom py-8">
          <h1 className="text-3xl font-display font-bold text-gray-800">
            {searchParams.get('search') 
              ? `ผลการค้นหา "${searchParams.get('search')}"` 
              : searchParams.get('brand')
              ? `รองเท้าสตั๊ด ${searchParams.get('brand')}`
              : 'สินค้าทั้งหมด'
            }
          </h1>
          {pagination.total > 0 && (
            <p className="text-gray-500 mt-2">พบ {pagination.total} รายการ</p>
          )}
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-gray-800">ตัวกรอง</h2>
                {activeFiltersCount > 0 && (
                  <button onClick={clearFilters} 
                  className="text-sm bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors cursor-pointer">
                      ล้างทั้งหมด
                  </button>
                )}
              </div>

              {/* Brand Filter */}
              <FilterSection title="แบรนด์">
                {BRANDS.map((brand) => (
                  <label key={brand.value} className="flex items-center gap-2 py-1 cursor-pointer">
                    <input
                      type="radio"
                      name="brand"
                      checked={searchParams.get('brand') === brand.value}
                      onChange={() => updateFilter('brand', 
                        searchParams.get('brand') === brand.value ? '' : brand.value
                      )}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-gray-700">{brand.label}</span>
                  </label>
                ))}
              </FilterSection>

              {/* Grade Filter */}
              <FilterSection title="เกรด">
                {GRADES.map((grade) => (
                <label key={grade.value} className="flex items-center gap-2 py-1 cursor-pointer">
                  <input
                      type="radio"
                      name="grade"
                      checked={searchParams.get('grade') === grade.value}
                      onChange={() => updateFilter('grade',
                      searchParams.get('grade') === grade.value ? '' : grade.value
                    )}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                <span className="text-gray-700">{grade.label}</span>
                </label>
                  ))}
              </FilterSection>

              {/* Stud Type Filter */}
              <FilterSection title="ประเภทปุ่ม">
                {STUD_TYPES.map((type) => (
                  <label key={type.value} className="flex items-center gap-2 py-1 cursor-pointer">
                    <input
                      type="radio"
                      name="studType"
                      checked={searchParams.get('studType') === type.value}
                      onChange={() => updateFilter('studType',
                        searchParams.get('studType') === type.value ? '' : type.value
                      )}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-gray-700">{type.label}</span>
                  </label>
                ))}
              </FilterSection>

              {/* Category Filter */}
              <FilterSection title="หมวดหมู่">
                {CATEGORIES.map((cat) => (
                  <label key={cat.value} className="flex items-center gap-2 py-1 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={searchParams.get('category') === cat.value}
                      onChange={() => updateFilter('category',
                        searchParams.get('category') === cat.value ? '' : cat.value
                      )}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-gray-700">{cat.label}</span>
                  </label>
                ))}
              </FilterSection>

              {/* Price Filter */}
              <FilterSection title="ราคา">
                {PRICE_RANGES.map((range) => (
                  <label key={range.value} className="flex items-center gap-2 py-1 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      checked={searchParams.get('priceMin') === String(range.min)}
                      onChange={() => {
                        if (searchParams.get('priceMin') === String(range.min)) {
                          updateFilter('priceMin', '');
                          updateFilter('priceMax', '');
                        } else {
                          const newParams = new URLSearchParams(searchParams);
                          newParams.set('priceMin', range.min);
                          if (range.max) newParams.set('priceMax', range.max);
                          else newParams.delete('priceMax');
                          setSearchParams(newParams);
                        }
                      }}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-gray-700">{range.label}</span>
                  </label>
                ))}
              </FilterSection>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex items-center justify-between">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setIsFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border rounded-lg"
              >
                <Filter className="w-4 h-4" />
                ตัวกรอง
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Sort */}
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-gray-500 hidden sm:block">เรียงตาม:</span>
                <select
                  value={searchParams.get('sort') || '-createdAt'}
                  onChange={(e) => updateFilter('sort', e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters Tags */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {searchParams.get('brand') && (
                  <FilterTag 
                    label={`แบรนด์: ${searchParams.get('brand')}`}
                    onRemove={() => updateFilter('brand', '')}
                  />
                )}
                {searchParams.get('grade') && (
                  <FilterTag 
                    label={`เกรด: ${searchParams.get('grade')}`}
                    onRemove={() => updateFilter('grade', '')}
                  />
                )}
                {searchParams.get('studType') && (
                  <FilterTag 
                    label={`ปุ่ม: ${searchParams.get('studType')}`}
                    onRemove={() => updateFilter('studType', '')}
                  />
                )}
                {searchParams.get('category') && (
                  <FilterTag 
                    label={`หมวด: ${searchParams.get('category')}`}
                    onRemove={() => updateFilter('category', '')}
                  />
                )}
              </div>
            )}

            {/* Products Grid */}
            {isLoading ? (
              <ProductGridSkeleton count={12} />
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500">เกิดข้อผิดพลาด กรุณาลองใหม่</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl">
                <p className="text-gray-500 text-lg">ไม่พบสินค้าที่ค้นหา</p>
                <Button onClick={clearFilters} variant="outline" className="mt-4 border-red-500 text-red-500 hover:bg-red-700 cursor-pointer">
                  ล้างตัวกรอง
                </Button>
              </div>
            ) : (
              <>
                <div className="product-grid">
                  {products.map((product, index) => (
                    <ProductCard key={product._id} product={product} index={index} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => {
                          const newParams = new URLSearchParams(searchParams);
                          newParams.set('page', page);
                          setSearchParams(newParams);
                        }}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          pagination.page === page
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-white z-50 overflow-y-auto lg:hidden"
            >
              <div className="p-4 border-b flex items-center justify-between">
                <span className="font-semibold">ตัวกรอง</span>
                <button onClick={() => setIsFilterOpen(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              {/* Same filter content as sidebar */}
              <div className="p-4">
                <FilterSection title="แบรนด์">
                  {BRANDS.map((brand) => (
                    <label key={brand.value} className="flex items-center gap-2 py-1">
                      <input
                        type="radio"
                        name="brand-mobile"
                        checked={searchParams.get('brand') === brand.value}
                        onChange={() => updateFilter('brand', brand.value)}
                        className="text-primary-600"
                      />
                      <span>{brand.label}</span>
                    </label>
                  ))}
                </FilterSection>
              </div>
              <div className="p-4 border-t">
                <Button fullWidth onClick={() => setIsFilterOpen(false)}>
                  ดูผลลัพธ์ ({pagination.total || 0})
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Filter Section Component
function FilterSection({ title, children }) {
  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <div className="border-b pb-4 mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-2"
      >
        <span className="font-medium text-gray-800">{title}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <div className="mt-2">{children}</div>}
    </div>
  );
}

// Filter Tag Component
function FilterTag({ label, onRemove }) {
  return (
      <button onClick={onRemove} className="hover:text-primary-900">
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-200 text-primary-900 rounded-full text-1xl cursor-pointer">
          {label}
          <X className='w-5 h-5 text-red-700 cursor-pointer' />
        </span>
      </button>
  );
}


