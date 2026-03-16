import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Eye, Clock } from 'lucide-react';
import api from '../../lib/axios';
import { Spinner } from '../../components/ui/Loading';
import { formatPrice, formatDateTime, getOrderStatus } from '../../lib/utils';

export default function AdminOrders() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders', { page, status: statusFilter, search }],
    queryFn: async () => {
      const params = new URLSearchParams({ page, limit: 15 });
      if (statusFilter) params.set('status', statusFilter);
      if (search) params.set('search', search);
      const res = await api.get(`/orders?${params}`);
      return res;
    },
  });

  const orders = data?.data || data?.orders || [];
  const pagination = data?.pagination || {};

  const statusTabs = [
    { value: '', label: 'ทั้งหมด' },
    { value: 'pending', label: 'รอดำเนินการ' },
    { value: 'confirmed', label: 'ยืนยันแล้ว' },
    { value: 'processing', label: 'กำลังเตรียม' },
    { value: 'shipped', label: 'จัดส่งแล้ว' },
    { value: 'delivered', label: 'ส่งถึงแล้ว' },
    { value: 'cancelled', label: 'ยกเลิก' },
  ];

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-indigo-100 text-indigo-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const getPaymentStatusDisplay = (order) => {
    if (order.orderStatus === 'cancelled') {
      return {
        text: 'ยกเลิก',
        className: 'bg-red-100 text-red-700',
      };
    }

    if (order.isPaid) {
      return {
        text: 'ชำระแล้ว',
        className: 'bg-green-100 text-green-700',
      };
    }

    return {
      text: 'รอชำระ',
      className: 'bg-yellow-100 text-yellow-700',
    };
  };

  const handleOpenOrder = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">คำสั่งซื้อทั้งหมด</h2>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatusFilter(tab.value);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
              ${statusFilter === tab.value
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาหมายเลขคำสั่งซื้อ หรือชื่อผู้สั่ง..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">ไม่พบคำสั่งซื้อ</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">หมายเลข</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">ลูกค้า</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">รายการ</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">ยอดรวม</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">สถานะ</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">ชำระเงิน</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">วันที่</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const status = getOrderStatus(order.orderStatus);
                  const paymentStatus = getPaymentStatusDisplay(order);

                  return (
                    <tr key={order._id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-800">{order.orderNumber}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {order.user?.name || order.shippingAddress?.fullName || '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{order.orderItems?.length || 0} รายการ</td>
                      <td className="py-3 px-4 font-medium">{formatPrice(order.totalPrice)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.orderStatus]}`}>
                          {status.text}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${paymentStatus.className}`}>
                          {paymentStatus.text}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-xs">{formatDateTime(order.createdAt)}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenOrder(order._id)}
                          className="p-2 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 inline-flex"
                          aria-label={`ดูรายละเอียดคำสั่งซื้อ ${order.orderNumber}`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium ${
                    page === p ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
