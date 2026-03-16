import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin, CreditCard, Truck, Shield, ChevronLeft,
  Building, QrCode, Banknote, CheckCircle
} from 'lucide-react';
import useCartStore from '../stores/cartStore';
import useAuthStore from '../stores/authStore';
import { useCreateOrder, useCheckStock } from '../hooks/useOrders';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { formatPrice, getProductImage } from '../lib/utils';
import { PROVINCES, PAYMENT_METHODS } from '../lib/constants';

function buildShippingAddress(user, defaultAddress) {
  return {
    fullName: defaultAddress?.fullName || user?.name || '',
    phone: defaultAddress?.phone || user?.phone || '',
    address: defaultAddress?.address || '',
    city: defaultAddress?.city || '',
    postalCode: defaultAddress?.postalCode || '',
  };
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, getCartTotals, getCheckoutItems } = useCartStore();
  const createOrder = useCreateOrder();
  const checkStock = useCheckStock();

  const { subtotal, shipping, total } = getCartTotals();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultAddress = useMemo(() => {
    return user?.addresses?.find((addr) => addr.isDefault) || user?.addresses?.[0] || null;
  }, [user]);

  const [shippingAddress, setShippingAddress] = useState(() =>
    buildShippingAddress(user, defaultAddress)
  );

  const [paymentMethod, setPaymentMethod] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // auto-fill เฉพาะตอนที่ฟอร์มยังไม่มีที่อยู่จริง
    setShippingAddress((prev) => {
      const hasTypedAddress =
        prev.address?.trim() || prev.city?.trim() || prev.postalCode?.trim();

      if (hasTypedAddress) return prev;

      return buildShippingAddress(user, defaultAddress);
    });
  }, [user, defaultAddress]);

  const applyDefaultAddress = () => {
    setShippingAddress(buildShippingAddress(user, defaultAddress));
  };

  if (items.length === 0) {
    return (
      <div className="container-custom py-20 text-center">
        <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">ตะกร้าว่างเปล่า</h2>
        <p className="text-gray-500 mb-6">กรุณาเลือกสินค้าก่อนดำเนินการสั่งซื้อ</p>
        <Link to="/products">
          <Button>ไปเลือกสินค้า</Button>
        </Link>
      </div>
    );
  }

  const validateShipping = () => {
    const newErrors = {};
    if (!shippingAddress.fullName.trim()) newErrors.fullName = 'กรุณาระบุชื่อผู้รับ';
    if (!shippingAddress.phone.trim()) newErrors.phone = 'กรุณาระบุเบอร์โทร';
    else if (!/^[0-9]{10}$/.test(shippingAddress.phone)) newErrors.phone = 'เบอร์โทรต้อง 10 หลัก';
    if (!shippingAddress.address.trim()) newErrors.address = 'กรุณาระบุที่อยู่';
    if (!shippingAddress.city.trim()) newErrors.city = 'กรุณาระบุจังหวัด';
    if (!shippingAddress.postalCode.trim()) newErrors.postalCode = 'กรุณาระบุรหัสไปรษณีย์';
    else if (!/^[0-9]{5}$/.test(shippingAddress.postalCode)) newErrors.postalCode = 'รหัสไปรษณีย์ต้อง 5 หลัก';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePayment = () => {
    if (!paymentMethod) {
      setErrors({ paymentMethod: 'กรุณาเลือกวิธีชำระเงิน' });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateShipping()) {
      setStep(2);
      window.scrollTo(0, 0);
    } else if (step === 2 && validatePayment()) {
      setStep(3);
      window.scrollTo(0, 0);
    }
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);

    try {
      const stockCheck = await checkStock.mutateAsync(
        items.map((item) => ({
          productId: item.product._id,
          size: item.size,
          quantity: item.quantity,
        }))
      );

      if (!stockCheck.allAvailable) {
        const unavailable = stockCheck.items.filter((i) => !i.available);
        const messages = unavailable.map((i) => `${i.name}: ${i.reason}`).join('\n');
        alert(`สินค้าบางรายการไม่พร้อม:\n${messages}`);
        setIsSubmitting(false);
        return;
      }

      const order = await createOrder.mutateAsync({
        orderItems: getCheckoutItems(),
        shippingAddress,
        paymentMethod,
      });

      navigate(`/orders/${order._id}`, { replace: true });
    } catch (error) {
      console.error('Order error:', error);
      setIsSubmitting(false);
    }
  };

  const paymentIcons = {
    credit_card: CreditCard,
    bank_transfer: Building,
    promptpay: QrCode,
    cod: Banknote,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container-custom py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => (step > 1 ? setStep(step - 1) : navigate(-1))}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-display font-bold text-gray-800">ดำเนินการสั่งซื้อ</h1>
          </div>

          {/* Steps */}
          <div className="flex items-center gap-4 mt-6">
            {[
              { num: 1, label: 'ที่อยู่จัดส่ง' },
              { num: 2, label: 'วิธีชำระเงิน' },
              { num: 3, label: 'ยืนยันคำสั่งซื้อ' },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center gap-2 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${step >= s.num ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}
                >
                  {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
                </div>
                <span
                  className={`text-sm font-medium hidden sm:block
                  ${step >= s.num ? 'text-primary-600' : 'text-gray-400'}`}
                >
                  {s.label}
                </span>
                {i < 2 && (
                  <div className={`flex-1 h-0.5 ${step > s.num ? 'bg-primary-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping Address */}
            {step === 1 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-primary-600" />
                    <h2 className="text-xl font-bold text-gray-800">ที่อยู่จัดส่ง</h2>
                  </div>

                  {defaultAddress && (
                    <button
                      type="button"
                      onClick={applyDefaultAddress}
                      className="text-sm text-primary-600 hover:underline"
                    >
                      ใช้ที่อยู่เริ่มต้นจากโปรไฟล์
                    </button>
                  )}
                </div>

                {defaultAddress && (
                  <div className="mb-6 rounded-lg bg-primary-50 border border-primary-100 p-4 text-sm text-gray-700">
                    <p className="font-medium text-primary-700 mb-1">ที่อยู่เริ่มต้นจากโปรไฟล์</p>
                    <p>{defaultAddress.fullName}</p>
                    <p>{defaultAddress.phone}</p>
                    <p>{defaultAddress.address}</p>
                    <p>{defaultAddress.city} {defaultAddress.postalCode}</p>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="ชื่อผู้รับ"
                    value={shippingAddress.fullName}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                    error={errors.fullName}
                    required
                  />
                  <Input
                    label="เบอร์โทรศัพท์"
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                    error={errors.phone}
                    placeholder="เช่น 0812345678"
                    required
                  />
                  <div className="sm:col-span-2">
                    <Input
                      label="ที่อยู่"
                      value={shippingAddress.address}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                      error={errors.address}
                      placeholder="เช่น 999/99 ซอยสุขุมวิท 99 แขวงพระโขนง เขตคลองเตย"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      จังหวัด <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent
                        ${errors.city ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'}`}
                    >
                      <option value="">เลือกจังหวัด</option>
                      {PROVINCES.map((province) => (
                        <option key={province} value={province}>{province}</option>
                      ))}
                    </select>
                    {errors.city && <p className="mt-1.5 text-sm text-red-500">{errors.city}</p>}
                  </div>
                  <Input
                    label="รหัสไปรษณีย์"
                    value={shippingAddress.postalCode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                    error={errors.postalCode}
                    placeholder="เช่น 10110"
                    required
                  />
                </div>

                <div className="mt-6 flex justify-end">
                  <Button size="lg" onClick={handleNextStep}>
                    ถัดไป: เลือกวิธีชำระเงิน
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="w-6 h-6 text-primary-600" />
                  <h2 className="text-xl font-bold text-gray-800">วิธีชำระเงิน</h2>
                </div>

                <div className="space-y-3">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = paymentIcons[method.value] || CreditCard;

                    return (
                      <label
                        key={method.value}
                        className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all
                          ${paymentMethod === method.value
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.value}
                          checked={paymentMethod === method.value}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="text-primary-600 focus:ring-primary-500"
                        />
                        <Icon className="w-6 h-6 text-gray-600" />
                        <span className="font-medium text-gray-800">{method.label}</span>
                      </label>
                    );
                  })}
                </div>

                {errors.paymentMethod && (
                  <p className="mt-3 text-sm text-red-500">{errors.paymentMethod}</p>
                )}

                <div className="mt-6 flex justify-between">
                  <Button variant="ghost" onClick={() => setStep(1)}>
                    <ChevronLeft className="w-4 h-4" /> กลับ
                  </Button>
                  <Button size="lg" onClick={handleNextStep}>
                    ถัดไป: ยืนยันคำสั่งซื้อ
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Review Order */}
            {step === 3 && (
              <div className="space-y-6">
                {/* Shipping Summary */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary-600" /> ที่อยู่จัดส่ง
                    </h3>
                    <button onClick={() => setStep(1)} className="text-sm text-primary-600 hover:underline">
                      แก้ไข
                    </button>
                  </div>
                  <div className="text-gray-600">
                    <p className="font-medium text-gray-800">{shippingAddress.fullName}</p>
                    <p>{shippingAddress.phone}</p>
                    <p>{shippingAddress.address}</p>
                    <p>{shippingAddress.city} {shippingAddress.postalCode}</p>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-primary-600" /> วิธีชำระเงิน
                    </h3>
                    <button onClick={() => setStep(2)} className="text-sm text-primary-600 hover:underline">
                      แก้ไข
                    </button>
                  </div>
                  <p className="text-gray-600">
                    {PAYMENT_METHODS.find((m) => m.value === paymentMethod)?.label}
                  </p>
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="font-bold text-gray-800 mb-4">รายการสินค้า ({items.length} รายการ)</h3>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={`${item.product._id}-${item.size}`}
                        className="flex gap-4 pb-4 border-b last:border-0"
                      >
                        <img
                          src={getProductImage(item.product.images)}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{item.product.name}</p>
                          <p className="text-sm text-gray-500">ไซส์: {item.size} CM | จำนวน: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-gray-800">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Place Order */}
                <div className="flex justify-between">
                  <Button variant="ghost" onClick={() => setStep(2)}>
                    <ChevronLeft className="w-4 h-4" /> กลับ
                  </Button>
                  <Button
                    size="lg"
                    onClick={handlePlaceOrder}
                    isLoading={isSubmitting}
                    leftIcon={<Shield className="w-5 h-5" />}
                  >
                    ยืนยันสั่งซื้อ • {formatPrice(total)}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h3 className="font-bold text-gray-800 mb-4">สรุปคำสั่งซื้อ</h3>

              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={`${item.product._id}-${item.size}`} className="flex items-center gap-3">
                    <img
                      src={getProductImage(item.product.images)}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.product.name}</p>
                      <p className="text-xs text-gray-500">ไซส์ {item.size} × {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">{formatPrice(item.product.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <hr className="my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">ราคาสินค้า</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">ค่าจัดส่ง</span>
                  <span className={shipping === 0 ? 'text-green-600' : ''}>
                    {shipping === 0 ? 'ฟรี' : formatPrice(shipping)}
                  </span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>รวมทั้งหมด</span>
                  <span className="text-primary-600">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary-600" />
                  <span>ชำระเงินปลอดภัย 100%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary-600" />
                  <span>จัดส่งภายใน 3-5 วันทำการ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


