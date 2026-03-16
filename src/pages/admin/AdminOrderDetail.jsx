import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft, MapPin, Phone, CreditCard, Truck,
  XCircle, Send, CheckCircle
} from 'lucide-react';
import api from '../../lib/axios';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Loading';
import { formatPrice, formatDateTime, getOrderStatus, getProductImage } from '../../lib/utils';
import toast from 'react-hot-toast';

function unwrapOrderResponse(res) {
  return res?.data?.order || res?.order || res?.data || res || null;
}

function getPaymentMethodLabel(method) {
  const normalized = String(method || '').toLowerCase();

  const labels = {
    credit_card: 'บัตรเครดิต/เดบิต',
    bank_transfer: 'โอนเงินผ่านธนาคาร',
    promptpay: 'PromptPay',
    cod: 'เก็บเงินปลายทาง',
  };

  return labels[normalized] || method || '-';
}

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['admin', 'order', id],
    queryFn: async () => {
      const res = await api.get(`/orders/${id}`);
      return unwrapOrderResponse(res);
    },
    enabled: !!id,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ status, note }) => {
      const res = await api.put(`/orders/${id}/status`, { status, note });
      return unwrapOrderResponse(res);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'order', id] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] }),
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
      ]);
      toast.success('อัปเดตสถานะสำเร็จ');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'อัปเดตไม่สำเร็จ');
    },
  });

  const updateShipping = useMutation({
    mutationFn: async () => {
      const res = await api.put(`/orders/${id}/shipping`, { trackingNumber });
      return unwrapOrderResponse(res);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'order', id] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] }),
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
      ]);
      toast.success('บันทึกเลขพัสดุและอัปเดตเป็นจัดส่งแล้วสำเร็จ');
      setTrackingNumber('');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'อัปเดตเลขพัสดุไม่สำเร็จ');
    },
  });

  const updatePaid = useMutation({
    mutationFn: async () => {
      const res = await api.put(`/orders/${id}/pay`, {
        status: 'paid-by-admin',
      });
      return unwrapOrderResponse(res);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'order', id] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] }),
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
      ]);
      toast.success('บันทึกว่าลูกค้าชำระเงินแล้วสำเร็จ');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'บันทึกการชำระเงินไม่สำเร็จ');
    },
  });

  const cancelOrder = useMutation({
    mutationFn: async () => {
      const res = await api.put(`/orders/${id}/cancel`, { reason: cancelReason });
      return unwrapOrderResponse(res);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'order', id] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] }),
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
      ]);
      toast.success('ยกเลิกคำสั่งซื้อสำเร็จ');
      setShowCancelModal(false);
      setCancelReason('');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'ยกเลิกคำสั่งซื้อไม่สำเร็จ');
    },
  });

  if (isLoading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  if (error || !order) {
    return <div className="text-center py-20 text-gray-500">ไม่พบคำสั่งซื้อ</div>;
  }

  const status = getOrderStatus(order.orderStatus);

  const paymentMethod = String(order.paymentMethod || '').toLowerCase();
  const isCod = paymentMethod === 'cod';
  const isOnlinePayment = ['credit_card', 'bank_transfer', 'promptpay'].includes(paymentMethod);

  const canMarkPaid =
    !order.isPaid &&
    (
      (isOnlinePayment && order.orderStatus === 'pending') ||
      (isCod && order.orderStatus === 'shipped')
    );

  const nextStatusMap = {
    pending: (isCod || order.isPaid)
      ? [{ value: 'confirmed', label: 'ยืนยันคำสั่งซื้อ', color: 'bg-blue-600' }]
      : [],
    confirmed: [{ value: 'processing', label: 'เริ่มเตรียมสินค้า', color: 'bg-indigo-600' }],
    processing: [],
    shipped: (!isCod || order.isPaid)
      ? [{ value: 'delivered', label: 'ส่งถึงแล้ว', color: 'bg-green-600' }]
      : [],
    delivered: [],
    cancelled: [],
  };

  const nextStatuses = nextStatusMap[order.orderStatus] || [];
  const canCancel = ['pending', 'confirmed', 'processing'].includes(order.orderStatus);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
    processing: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    shipped: 'bg-purple-100 text-purple-800 border-purple-300',
    delivered: 'bg-green-100 text-green-800 border-green-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300',
  };

  const paymentStatusText =
    order.orderStatus === 'cancelled'
      ? 'ยกเลิก'
      : order.isPaid
        ? 'ชำระแล้ว'
        : 'รอชำระ';

  const paymentStatusClass =
    order.orderStatus === 'cancelled'
      ? 'text-red-600'
      : order.isPaid
        ? 'text-green-600'
        : 'text-yellow-600';

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/orders')} className="p-2 hover:bg-gray-200 rounded-lg">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-800">คำสั่งซื้อ #{order.orderNumber}</h2>
            <p className="text-sm text-gray-500">{formatDateTime(order.createdAt)}</p>
          </div>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-bold border ${statusColors[order.orderStatus]}`}>
          {status.text}
        </span>
      </div>

      {/* Status Actions */}
      {(nextStatuses.length > 0 || canCancel || canMarkPaid || order.orderStatus === 'processing') && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4">อัปเดตสถานะ</h3>

          <div className="flex flex-wrap gap-3">
            {canMarkPaid && (
              <Button
                onClick={() => updatePaid.mutate()}
                isLoading={updatePaid.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle className="w-4 h-4" />
                ลูกค้าชำระเงินแล้ว
              </Button>
            )}

            {nextStatuses.map((next) => (
              <Button
                key={next.value}
                onClick={() => updateStatus.mutate({ status: next.value })}
                isLoading={updateStatus.isPending}
                className={`${next.color} hover:opacity-90 text-white`}
              >
                {next.label}
              </Button>
            ))}

            {canCancel && (
              <Button variant="danger" onClick={() => setShowCancelModal(true)}>
                <XCircle className="w-4 h-4" /> ยกเลิกคำสั่งซื้อ
              </Button>
            )}
          </div>

          {/* Tracking Number: processing -> shipped */}
          {order.orderStatus === 'processing' && (
            <div className="mt-4 flex gap-3">
              <Input
                placeholder="เลขพัสดุ"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={() => updateShipping.mutate()}
                disabled={!trackingNumber.trim()}
                isLoading={updateShipping.isPending}
                leftIcon={<Send className="w-4 h-4" />}
              >
                บันทึกเลขพัสดุและจัดส่งแล้ว
              </Button>
            </div>
          )}

          {order.trackingNumber && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700">เลขพัสดุ: <strong>{order.trackingNumber}</strong></span>
            </div>
          )}
        </div>
      )}

      {/* Cancelled note */}
      {order.orderStatus === 'cancelled' && order.note && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{order.note}</span>
        </div>
      )}

      {/* Order Items */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-bold text-gray-800 mb-4">รายการสินค้า ({order.orderItems?.length} รายการ)</h3>
        <div className="space-y-4">
          {order.orderItems?.map((item, i) => (
            <div key={i} className="flex gap-4 pb-4 border-b last:border-0">
              <img
                src={item.image || getProductImage([])}
                alt={item.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-800">{item.name}</p>
                <p className="text-sm text-gray-500">ไซส์: {item.size} CM × {item.qty} คู่</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatPrice(item.price * item.qty)}</p>
                <p className="text-xs text-gray-400">{formatPrice(item.price)}/คู่</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Customer & Shipping */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary-600" /> ข้อมูลจัดส่ง
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p className="font-medium text-gray-800 text-base">{order.shippingAddress?.fullName}</p>
            <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> {order.shippingAddress?.phone}</p>
            <p>{order.shippingAddress?.address}</p>
            <p>{order.shippingAddress?.city} {order.shippingAddress?.postalCode}</p>
          </div>
          {order.user && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-500">ข้อมูลลูกค้า</p>
              <p className="font-medium">{order.user.name}</p>
              <p className="text-sm text-gray-500">{order.user.email}</p>
            </div>
          )}
        </div>

        {/* Payment Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary-600" /> สรุปการชำระเงิน
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">วิธีชำระเงิน</span>
              <span className="font-medium">{getPaymentMethodLabel(order.paymentMethod)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">ราคาสินค้า</span>
              <span>{formatPrice(order.itemsPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">ค่าจัดส่ง</span>
              <span>{order.shippingPrice === 0 ? 'ฟรี' : formatPrice(order.shippingPrice)}</span>
            </div>
            <hr />
            <div className="flex justify-between text-lg font-bold">
              <span>รวมทั้งหมด</span>
              <span className="text-primary-600">{formatPrice(order.totalPrice)}</span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-gray-500">สถานะชำระเงิน</span>
              <span className={`font-medium ${paymentStatusClass}`}>
                {paymentStatusText}
              </span>
            </div>
            {order.paidAt && (
              <p className="text-xs text-gray-400">ชำระเมื่อ: {formatDateTime(order.paidAt)}</p>
            )}
          </div>
        </div>
      </div>

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
              <Button
                variant="danger"
                fullWidth
                onClick={() => cancelOrder.mutate()}
                isLoading={cancelOrder.isPending}
                disabled={!cancelReason.trim()}
              >
                ยืนยันยกเลิก
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


