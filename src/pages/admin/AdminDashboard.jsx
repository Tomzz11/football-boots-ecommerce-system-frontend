import { useQuery } from '@tanstack/react-query';
import {
  DollarSign, ShoppingCart, Package, AlertTriangle
} from 'lucide-react';
import api from '../../lib/axios';
import { formatPrice } from '../../lib/utils';
import { Spinner } from '../../components/ui/Loading';

export default function AdminDashboard() {
  const { data: productStats, isLoading: loadingProducts } = useQuery({
    queryKey: ['admin', 'product-stats'],
    queryFn: async () => {
      const res = await api.get('/products/admin/stats');
      return res.data?.stats || res.data || res;
    },
  });

  const { data: orderStats, isLoading: loadingOrders } = useQuery({
    queryKey: ['admin', 'order-stats'],
    queryFn: async () => {
      const res = await api.get('/orders/admin/stats');
      return res.data?.stats || res.data || res;
    },
  });

  const { data: lowStock } = useQuery({
    queryKey: ['admin', 'low-stock'],
    queryFn: async () => {
      const res = await api.get('/inventory/low-stock?threshold=5');
      return res.data?.products || res.data || [];
    },
  });

  if (loadingProducts || loadingOrders) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const summary = orderStats?.summary || {};
  const statusBreakdown = orderStats?.statusBreakdown || {};

  const statCards = [
    {
      title: 'ยอดขายรวม',
      value: formatPrice(summary.totalRevenue || 0),
      icon: DollarSign,
      color: 'bg-green-500',
      subtitle: `${summary.paidOrders || 0} ออเดอร์ที่ชำระแล้ว`,
    },
    {
      title: 'คำสั่งซื้อทั้งหมด',
      value: summary.totalOrders || 0,
      icon: ShoppingCart,
      color: 'bg-blue-500',
      subtitle: `รอดำเนินการ ${statusBreakdown.pending || 0} รายการ`,
    },
    {
      title: 'สินค้าทั้งหมด',
      value: productStats?.activeProducts || 0,
      icon: Package,
      color: 'bg-purple-500',
      subtitle: `หมดสต็อก ${productStats?.outOfStock || 0} รายการ`,
    },
    {
      title: 'สต็อกต่ำ',
      value: lowStock?.length || productStats?.lowStock || 0,
      icon: AlertTriangle,
      color: 'bg-yellow-500',
      subtitle: 'รายการที่ต้องเติมสต็อก',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              <p className="text-sm text-gray-500 mt-1">{card.title}</p>
              <p className="text-xs text-gray-400 mt-1">{card.subtitle}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Order Status Breakdown */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4">สถานะคำสั่งซื้อ</h3>
          <div className="space-y-3">
            {[
              { key: 'pending', label: 'รอดำเนินการ', color: 'bg-yellow-500' },
              { key: 'confirmed', label: 'ยืนยันแล้ว', color: 'bg-blue-500' },
              { key: 'processing', label: 'กำลังเตรียม', color: 'bg-indigo-500' },
              { key: 'shipped', label: 'จัดส่งแล้ว', color: 'bg-purple-500' },
              { key: 'delivered', label: 'ส่งถึงแล้ว', color: 'bg-green-500' },
              { key: 'cancelled', label: 'ยกเลิก', color: 'bg-red-500' },
            ].map((status) => {
              const count = statusBreakdown[status.key] || 0;
              const total = summary.totalOrders || 1;
              const percent = Math.round((count / total) * 100);
              return (
                <div key={status.key} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-28">{status.label}</span>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${status.color} rounded-full transition-all`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Products by Brand */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4">สินค้าตามแบรนด์</h3>
          <div className="space-y-3">
            {Object.entries(productStats?.byBrand || {}).map(([brand, count]) => {
              const total = productStats?.activeProducts || 1;
              const percent = Math.round((count / total) * 100);
              return (
                <div key={brand} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-20 font-medium">{brand}</span>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>

          <hr className="my-4" />

          <h3 className="font-bold text-gray-800 mb-4">สินค้าตามหมวดหมู่</h3>
          <div className="space-y-3">
            {Object.entries(productStats?.byCategory || {}).map(([cat, count]) => {
              const total = productStats?.activeProducts || 1;
              const percent = Math.round((count / total) * 100);
              return (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-20 font-medium">{cat}</span>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStock && lowStock.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            แจ้งเตือนสต็อกต่ำ
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">สินค้า</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">แบรนด์</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">ไซส์</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">คงเหลือ</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((item) =>
                  item.lowStockSizes?.map((size, i) => (
                    <tr key={`${item._id}-${size.size}`} className="border-b last:border-0 hover:bg-gray-50">
                      {i === 0 && (
                        <>
                          <td className="py-3 px-4 font-medium" rowSpan={item.lowStockSizes.length}>
                            {item.name}
                          </td>
                          <td className="py-3 px-4" rowSpan={item.lowStockSizes.length}>
                            {item.brand}
                          </td>
                        </>
                      )}
                      <td className="py-3 px-4">{size.size} CM</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                          ${size.available <= 2 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {size.available} คู่
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

