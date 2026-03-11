import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Package, ChevronLeft, Truck, Clock, CheckCircle,
  XCircle, CreditCard, MapPin, Phone, AlertCircle
} from 'lucide-react';
import { useMyOrders, useOrder, useCancelOrder } from '../hooks/useOrders';
import Button from '../components/ui/Button';
import { Spinner } from '../components/ui/Loading';
import { formatPrice, formatDateTime, getOrderStatus, getProductImage } from '../lib/utils';

// ============================================
// Orders List Page
// ============================================
export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useMyOrders({
    page,
    limit: 10,
    ...(statusFilter && { status: statusFilter }),
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container-custom py-6">
          <h1 className="text-2xl font-display font-bold text-gray-800 flex items-center gap-3">
            <Package className="w-7 h-7 text-primary-600" />
            คำสั่งซื้อของฉัน
          </h1>
        </div>
      </div>

      <div className="container-custom py-6">
        {/* Status Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setStatusFilter(tab.value); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                ${statusFilter === tab.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">ยังไม่มีคำสั่งซื้อ</h3>
            <p className="text-gray-500 mb-6">เลือกสินค้าที่ชอบแล้วสั่งซื้อเลย!</p>
            <Link to="/products">
              <Button>ไปเลือกสินค้า</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-lg font-medium ${
                      page === p ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
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
    </div>
  );
}

// ============================================
// Order Card Component
// ============================================
function OrderCard({ order }) {
  const status = getOrderStatus(order.orderStatus);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <Link to={`/orders/${order._id}`}
      className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-500">หมายเลขคำสั่งซื้อ</p>
          <p className="font-bold text-gray-800">{order.orderNumber}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.orderStatus]}`}>
          {status.text}
        </span>
      </div>

      {/* Items Preview */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex -space-x-2">
          {order.orderItems?.slice(0, 3).map((item, i) => (
            <img
              key={i}
              src={item.image || getProductImage([])}
              alt={item.name}
              className="w-12 h-12 rounded-lg border-2 border-white object-cover"
            />
          ))}
          {order.orderItems?.length > 3 && (
            <div className="w-12 h-12 rounded-lg border-2 border-white bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-500">
              +{order.orderItems.length - 3}
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600">
            {order.orderItems?.length} รายการ
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t">
        <p className="text-sm text-gray-500">
          {formatDateTime(order.createdAt)}
        </p>
        <p className="font-bold text-primary-600">
          {formatPrice(order.totalPrice)}
        </p>
      </div>
    </Link>
  );
}

// ============================================
// Order Detail Page (export separately)
// ============================================
export function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: order, isLoading, error } = useOrder(id);
  const cancelOrder = useCancelOrder();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container-custom py-20 text-center">
        <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-4">ไม่พบคำสั่งซื้อ</h2>
        <Link to="/orders">
          <Button>กลับไปหน้าคำสั่งซื้อ</Button>
        </Link>
      </div>
    );
  }

  const status = getOrderStatus(order.orderStatus);
  const canCancel = ['pending', 'confirmed'].includes(order.orderStatus);

  const statusSteps = [
    { key: 'pending', label: 'รอดำเนินการ', icon: Clock },
    { key: 'confirmed', label: 'ยืนยันแล้ว', icon: CheckCircle },
    { key: 'processing', label: 'กำลังเตรียม', icon: Package },
    { key: 'shipped', label: 'จัดส่งแล้ว', icon: Truck },
    { key: 'delivered', label: 'ส่งถึงแล้ว', icon: CheckCircle },
  ];

  const currentStepIndex = statusSteps.findIndex(s => s.key === order.orderStatus);

  const handleCancel = async () => {
    if (!cancelReason.trim()) return;
    try {
      await cancelOrder.mutateAsync({ orderId: order._id, reason: cancelReason });
      setShowCancelModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container-custom py-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/orders')} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-display font-bold text-gray-800">
                คำสั่งซื้อ #{order.orderNumber}
              </h1>
              <p className="text-sm text-gray-500">{formatDateTime(order.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-6 space-y-6">
        {/* Status Timeline */}
        {order.orderStatus !== 'cancelled' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-6">สถานะคำสั่งซื้อ</h3>
            <div className="flex items-center justify-between">
              {statusSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                return (
                  <div key={step.key} className="flex flex-col items-center flex-1">
                    <div className="flex items-center w-full">
                      {index > 0 && (
                        <div className={`flex-1 h-1 ${isActive ? 'bg-primary-600' : 'bg-gray-200'}`} />
                      )}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                        ${isCurrent ? 'bg-primary-600 text-white ring-4 ring-primary-100' :
                          isActive ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      {index < statusSteps.length - 1 && (
                        <div className={`flex-1 h-1 ${index < currentStepIndex ? 'bg-primary-600' : 'bg-gray-200'}`} />
                      )}
                    </div>
                    <span className={`text-xs mt-2 text-center ${isCurrent ? 'text-primary-600 font-bold' : 'text-gray-400'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Cancelled Status */}
        {order.orderStatus === 'cancelled' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <XCircle className="w-6 h-6 text-red-500" />
              <div>
                <p className="font-bold text-red-800">คำสั่งซื้อถูกยกเลิก</p>
                {order.note && <p className="text-sm text-red-600 mt-1">{order.note}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4">รายการสินค้า</h3>
          <div className="space-y-4">
            {order.orderItems?.map((item, index) => (
              <div key={index} className="flex gap-4 pb-4 border-b last:border-0">
                <img
                  src={item.image || getProductImage([])}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-500">ไซส์: {item.size} CM</p>
                  <p className="text-sm text-gray-500">จำนวน: {item.qty} คู่</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatPrice(item.price * item.qty)}</p>
                  <p className="text-sm text-gray-400">{formatPrice(item.price)}/คู่</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-600" /> ที่อยู่จัดส่ง
            </h3>
            <div className="text-gray-600 space-y-1">
              <p className="font-medium text-gray-800">{order.shippingAddress?.fullName}</p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4" /> {order.shippingAddress?.phone}
              </p>
              <p>{order.shippingAddress?.address}</p>
              <p>{order.shippingAddress?.city} {order.shippingAddress?.postalCode}</p>
            </div>
            {order.trackingNumber && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600">
                  <Truck className="w-4 h-4 inline mr-1" />
                  เลขพัสดุ: <span className="font-bold">{order.trackingNumber}</span>
                </p>
              </div>
            )}
          </div>

          {/* Payment & Price Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary-600" /> สรุปราคา
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">ราคาสินค้า</span>
                <span>{formatPrice(order.itemsPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">ค่าจัดส่ง</span>
                <span className={order.shippingPrice === 0 ? 'text-green-600' : ''}>
                  {order.shippingPrice === 0 ? 'ฟรี' : formatPrice(order.shippingPrice)}
                </span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between text-lg font-bold">
                <span>รวมทั้งหมด</span>
                <span className="text-primary-600">{formatPrice(order.totalPrice)}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-gray-500">สถานะชำระเงิน</span>
                <span className={order.isPaid ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium'}>
                  {order.isPaid ? 'ชำระแล้ว' : 'รอชำระเงิน'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cancel Button */}
        {canCancel && (
          <div className="flex justify-center">
            <Button variant="danger" onClick={() => setShowCancelModal(true)}>
              <XCircle className="w-4 h-4" /> ยกเลิกคำสั่งซื้อ
            </Button>
          </div>
        )}

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">ยกเลิกคำสั่งซื้อ</h3>
              <p className="text-gray-600 mb-4">กรุณาระบุเหตุผลในการยกเลิก</p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
                placeholder="เหตุผลในการยกเลิก..."
              />
              <div className="flex gap-3 mt-4">
                <Button variant="ghost" fullWidth onClick={() => setShowCancelModal(false)}>
                  ไม่ยกเลิก
                </Button>
                <Button variant="danger" fullWidth onClick={handleCancel}
                  isLoading={cancelOrder.isPending}
                  disabled={!cancelReason.trim()}>
                  ยืนยันยกเลิก
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
