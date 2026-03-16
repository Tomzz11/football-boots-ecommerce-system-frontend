import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  LogOut,
  Package,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../stores/authStore';
import useCartStore from '../../stores/cartStore';
import { cn } from '../../lib/utils';
import { BRANDS } from '../../lib/constants';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { items, openCart } = useCartStore();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top Bar */}
      <div className="bg-primary-600 text-white text-sm py-2">
        <div className="container-custom flex justify-between items-center">
          <p>🚚 ส่งฟรี! เมื่อสั่งซื้อครบ ฿2,000</p>
          <p className="hidden sm:block">📞 โทร: 02-123-4567</p>
        </div>
      </div>

      {/* Main Header */}
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">⚽</span>
            </div>
            <span className="hidden sm:block font-display font-bold text-xl text-gray-800">
              Tommy11 Football Store
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link 
              to="/products" 
              className="font-medium text-gray-700 hover:text-primary-600 transition-colors"
            >
              สินค้าทั้งหมด
            </Link>
            <Link 
              to="/grades" 
              className="font-medium text-gray-700 hover:text-primary-600 transition-colors"
            >
              เกรดรองเท้า
            </Link>
            
            {/* Brands Dropdown */}
            <div className="relative group">
              <button className="font-medium text-gray-700 hover:text-primary-600 transition-colors flex items-center gap-1">
                แบรนด์
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="bg-white rounded-lg shadow-xl border py-2 min-w-[160px]">
                  {BRANDS.map((brand) => (
                    <Link
                      key={brand.value}
                      to={`/products?brand=${brand.value}`}
                      className="block px-4 py-2 hover:bg-gray-100 transition-colors"
                    >
                      {brand.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

        <Link 
          to="/products?isFeatured=true" 
            className="font-medium text-gray-700 hover:text-primary-600 transition-colors"
        >
          สินค้าแนะนำ
        </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Search className="w-5 h-5 text-gray-600" />
            </button>

            {/* Cart */}  
          {(!isAuthenticated || user?.role !== 'admin') && (
            <button
              onClick={openCart}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-gray-600" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
          )}
            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:block font-medium text-gray-700">
                    {user?.name}
                  </span>
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border py-2"
                    >
                      <div className="px-4 py-3 border-b flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{user?.name}</p>
                          <p className="text-sm text-gray-500">{user?.email}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        โปรไฟล์
                      </Link>
                      
                    {user?.role !== 'admin' && (
                      <Link
                        to="/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors"
                      >
                        <Package className="w-4 h-4" />
                        คำสั่งซื้อ
                      </Link>
                    )}
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors text-primary-600"
                        >
                          <Settings className="w-4 h-4" />
                          Admin Panel
                        </Link>
                      )}
                      
                      <hr className="my-2" />
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 w-full hover:bg-gray-100 transition-colors text-red-600"
                      >
                        <LogOut className="w-4 h-4" />
                        ออกจากระบบ
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <User className="w-4 h-4" />
                เข้าสู่ระบบ
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween' }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-white z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-4 border-b flex items-center justify-between">
                <span className="font-display font-bold text-xl">เมนู</span>
                <button onClick={() => setIsMenuOpen(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <nav className="p-4 space-y-2">
                <Link
                  to="/products"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 rounded-lg hover:bg-gray-100"
                >
                  สินค้าทั้งหมด
                </Link>
                <Link
                  to="/grades"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 rounded-lg hover:bg-gray-100"
                >
                  เกรดรองเท้า
                </Link>
                
                <div className="px-4 py-2 text-sm font-semibold text-gray-500 uppercase">
                  แบรนด์
                </div>
                {BRANDS.map((brand) => (
                  <Link
                    key={brand.value}
                    to={`/products?brand=${brand.value}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-2 rounded-lg hover:bg-gray-100 ml-4"
                  >
                    {brand.label}
                  </Link>
                ))}
                
                {!isAuthenticated && (
                  <div className="pt-4 border-t mt-4">
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="block w-full text-center px-4 py-3 bg-primary-600 text-white rounded-lg"
                    >
                      เข้าสู่ระบบ
                    </Link>
                  </div>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <form onSubmit={handleSearch} className="flex items-center">
                <Search className="w-6 h-6 text-gray-400 ml-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหารองเท้าสตั๊ด..."
                  className="flex-1 px-4 py-4 text-lg focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="p-4 hover:bg-gray-100"
                >
                  <X className="w-6 h-6" />
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}



