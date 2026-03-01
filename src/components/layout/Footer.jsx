import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="container-custom py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">⚽</span>
              </div>
              <span className="font-display font-bold text-xl text-white">
                Football Cleats
              </span>
            </Link>
            <p className="text-gray-400 mb-6">
              ร้านขายรองเท้าสตั๊ดคุณภาพ จำหน่ายแบรนด์ชั้นนำ 
              Nike, Adidas, Puma, Mizuno ของแท้ 100%
            </p>
            
            {/* Social Links */}
            <div className="flex gap-4">
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-white text-lg mb-4">
              ลิงก์ด่วน
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/products" className="hover:text-primary-400 transition-colors">
                  สินค้าทั้งหมด
                </Link>
              </li>
              <li>
                <Link to="/products?brand=Nike" className="hover:text-primary-400 transition-colors">
                  Nike
                </Link>
              </li>
              <li>
                <Link to="/products?brand=Adidas" className="hover:text-primary-400 transition-colors">
                  Adidas
                </Link>
              </li>
              <li>
                <Link to="/products?brand=Puma" className="hover:text-primary-400 transition-colors">
                  Puma
                </Link>
              </li>
              <li>
                <Link to="/products?brand=Mizuno" className="hover:text-primary-400 transition-colors">
                  Mizuno
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-display font-semibold text-white text-lg mb-4">
              บริการลูกค้า
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/help/shipping" className="hover:text-primary-400 transition-colors">
                  การจัดส่งสินค้า
                </Link>
              </li>
              <li>
                <Link to="/help/returns" className="hover:text-primary-400 transition-colors">
                  นโยบายการคืนสินค้า
                </Link>
              </li>
              <li>
                <Link to="/help/size-guide" className="hover:text-primary-400 transition-colors">
                  วิธีวัดไซส์รองเท้า
                </Link>
              </li>
              <li>
                <Link to="/help/payment" className="hover:text-primary-400 transition-colors">
                  วิธีชำระเงิน
                </Link>
              </li>
              <li>
                <Link to="/help/faq" className="hover:text-primary-400 transition-colors">
                  คำถามที่พบบ่อย
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-semibold text-white text-lg mb-4">
              ติดต่อเรา
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                <span>
                  123 ถนนฟุตบอล แขวงสนามกีฬา<br />
                  เขตกีฬา กรุงเทพฯ 10110
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary-500 flex-shrink-0" />
                <a href="tel:021234567" className="hover:text-primary-400 transition-colors">
                  02-123-4567
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary-500 flex-shrink-0" />
                <a href="mailto:info@footballcleats.com" className="hover:text-primary-400 transition-colors">
                  info@footballcleats.com
                </a>
              </li>
            </ul>

            {/* Newsletter */}
            <div className="mt-6">
              <h4 className="font-medium text-white mb-2">รับข่าวสารและโปรโมชั่น</h4>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="อีเมลของคุณ"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-primary-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  สมัคร
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container-custom py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {currentYear} Football Cleats Store. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6 text-sm">
            <Link to="/privacy" className="text-gray-500 hover:text-gray-300 transition-colors">
              นโยบายความเป็นส่วนตัว
            </Link>
            <Link to="/terms" className="text-gray-500 hover:text-gray-300 transition-colors">
              ข้อกำหนดการใช้งาน
            </Link>
          </div>

          {/* Payment Methods */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 mr-2">ชำระเงินผ่าน:</span>
            <div className="flex gap-2">
              <div className="w-10 h-6 bg-white rounded flex items-center justify-center text-xs font-bold text-blue-600">
                VISA
              </div>
              <div className="w-10 h-6 bg-white rounded flex items-center justify-center text-xs font-bold text-red-600">
                MC
              </div>
              <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center text-xs font-bold text-white">
                PP
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

