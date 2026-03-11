import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  User, Lock, MapPin, Plus, Edit, Trash2,
  Phone, Mail, Shield, ChevronRight
} from 'lucide-react';
import useAuthStore from '../stores/authStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { formatDate } from '../lib/utils';
import { PROVINCES } from '../lib/constants';
import toast from 'react-hot-toast';
import api from '../lib/axios';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const isAdmin = user?.role === 'admin';

  const tabs = [
    { value: 'profile', label: 'ข้อมูลส่วนตัว', icon: User },
    { value: 'password', label: 'เปลี่ยนรหัสผ่าน', icon: Lock },
    ...(!isAdmin ? [{ value: 'addresses', label: 'ที่อยู่จัดส่ง', icon: MapPin }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container-custom py-6">
          <h1 className="text-2xl font-display font-bold text-gray-800 flex items-center gap-3">
            <User className="w-7 h-7 text-primary-600" />
            {isAdmin ? 'โปรไฟล์ Admin' : 'โปรไฟล์ของฉัน'}
          </h1>
        </div>
      </div>

      <div className="container-custom py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* User Info Card */}
              <div className="p-6 text-center border-b">
                <div className="w-20 h-20 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-3">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <p className="font-bold text-gray-800">{user?.name}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                    <Shield className="w-3 h-3" /> Admin
                  </span>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  สมาชิกตั้งแต่ {formatDate(user?.createdAt)}
                </p>
              </div>

              {/* Tabs */}
              <nav className="p-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.value}
                      onClick={() => setActiveTab(tab.value)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                        ${activeTab === tab.value
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && <ProfileForm />}
            {activeTab === 'password' && <PasswordForm />}
            {activeTab === 'addresses' && !isAdmin && <AddressManager />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Profile Form
// ============================================
function ProfileForm() {
  const { user, updateProfile, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
    },
  });

  const onSubmit = async (data) => {
    await updateProfile(data);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
        <User className="w-5 h-5 text-primary-600" />
        ข้อมูลส่วนตัว
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-lg">
        {/* Email (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">อีเมล</label>
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border rounded-lg text-gray-500">
            <Mail className="w-5 h-5" />
            {user?.email}
          </div>
          <p className="text-xs text-gray-400 mt-1">ไม่สามารถเปลี่ยนอีเมลได้</p>
        </div>

        <Input
          label="ชื่อ"
          leftIcon={<User className="w-5 h-5" />}
          error={errors.name?.message}
          {...register('name', {
            required: 'กรุณากรอกชื่อ',
            minLength: { value: 2, message: 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร' },
          })}
        />

        <Input
          label="เบอร์โทรศัพท์"
          leftIcon={<Phone className="w-5 h-5" />}
          placeholder="เช่น 0812345678"
          error={errors.phone?.message}
          {...register('phone', {
            pattern: { value: /^[0-9]{10}$/, message: 'เบอร์โทรต้อง 10 หลัก' },
          })}
        />

        <Button type="submit" isLoading={isLoading}>
          บันทึกการเปลี่ยนแปลง
        </Button>
      </form>
    </div>
  );
}

// ============================================
// Password Form
// ============================================
function PasswordForm() {
  const { changePassword, isLoading } = useAuthStore();
  const [showPasswords, setShowPasswords] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const newPassword = watch('newPassword');

  const onSubmit = async (data) => {
    const result = await changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
    if (result.success) {
      reset();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Lock className="w-5 h-5 text-primary-600" />
        เปลี่ยนรหัสผ่าน
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-lg">
        <Input
          label="รหัสผ่านปัจจุบัน"
          type={showPasswords ? 'text' : 'password'}
          leftIcon={<Lock className="w-5 h-5" />}
          error={errors.currentPassword?.message}
          {...register('currentPassword', {
            required: 'กรุณากรอกรหัสผ่านปัจจุบัน',
          })}
        />

        <Input
          label="รหัสผ่านใหม่"
          type={showPasswords ? 'text' : 'password'}
          leftIcon={<Lock className="w-5 h-5" />}
          error={errors.newPassword?.message}
          {...register('newPassword', {
            required: 'กรุณากรอกรหัสผ่านใหม่',
            minLength: { value: 6, message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' },
          })}
        />

        <Input
          label="ยืนยันรหัสผ่านใหม่"
          type={showPasswords ? 'text' : 'password'}
          leftIcon={<Lock className="w-5 h-5" />}
          error={errors.confirmNewPassword?.message}
          {...register('confirmNewPassword', {
            required: 'กรุณายืนยันรหัสผ่านใหม่',
            validate: (value) => value === newPassword || 'รหัสผ่านไม่ตรงกัน',
          })}
        />

        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
          <input
            type="checkbox"
            checked={showPasswords}
            onChange={(e) => setShowPasswords(e.target.checked)}
            className="rounded text-primary-600 focus:ring-primary-500"
          />
          แสดงรหัสผ่าน
        </label>

        <Button type="submit" isLoading={isLoading}>
          เปลี่ยนรหัสผ่าน
        </Button>
      </form>
    </div>
  );
}

// ============================================
// Address Manager (User only)
// ============================================
function AddressManager() {
  const { user, getProfile } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addresses = user?.addresses || [];

  const handleSave = async (addressData) => {
    setIsSubmitting(true);
    try {
      await api.post('/auth/addresses', addressData);
      await getProfile();
      setShowForm(false);
      setEditingAddress(null);
      toast.success('บันทึกที่อยู่สำเร็จ');
    } catch (err) {
      toast.error(err.response?.data?.message || 'บันทึกไม่สำเร็จ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm('ต้องการลบที่อยู่นี้หรือไม่?')) return;
    try {
      await api.delete(`/auth/addresses/${addressId}`);
      await getProfile();
      toast.success('ลบที่อยู่สำเร็จ');
    } catch (err) {
      toast.error('ลบไม่สำเร็จ');
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary-600" />
            ที่อยู่จัดส่ง
          </h2>
          {!showForm && (
            <Button size="sm" onClick={() => { setEditingAddress(null); setShowForm(true); }}
              leftIcon={<Plus className="w-4 h-4" />}>
              เพิ่มที่อยู่
            </Button>
          )}
        </div>

        {/* Address Form */}
        {showForm && (
          <AddressForm
            address={editingAddress}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingAddress(null); }}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Address List */}
        {!showForm && addresses.length === 0 && (
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">ยังไม่มีที่อยู่จัดส่ง</p>
          </div>
        )}

        {!showForm && addresses.map((addr) => (
          <div key={addr._id} className={`p-4 rounded-xl border-2 mb-3 ${addr.isDefault ? 'border-primary-300 bg-primary-50' : 'border-gray-200'}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-gray-800">{addr.fullName}</p>
                  {addr.isDefault && (
                    <span className="text-xs bg-primary-600 text-white px-2 py-0.5 rounded-full">ค่าเริ่มต้น</span>
                  )}
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {addr.label === 'home' ? 'บ้าน' : addr.label === 'work' ? 'ที่ทำงาน' : 'อื่นๆ'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {addr.phone}
                </p>
                <p className="text-sm text-gray-600 mt-1">{addr.address}</p>
                <p className="text-sm text-gray-600">{addr.city} {addr.postalCode}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(addr)}
                  className="p-2 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(addr._id)}
                  className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Address Form
// ============================================
function AddressForm({ address, onSave, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState({
    _id: address?._id || undefined,
    label: address?.label || 'home',
    fullName: address?.fullName || '',
    phone: address?.phone || '',
    address: address?.address || '',
    city: address?.city || '',
    postalCode: address?.postalCode || '',
    isDefault: address?.isDefault || false,
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'กรุณาระบุชื่อผู้รับ';
    if (!formData.phone.trim()) newErrors.phone = 'กรุณาระบุเบอร์โทร';
    else if (!/^[0-9]{10}$/.test(formData.phone)) newErrors.phone = 'เบอร์โทรต้อง 10 หลัก';
    if (!formData.address.trim()) newErrors.address = 'กรุณาระบุที่อยู่';
    if (!formData.city) newErrors.city = 'กรุณาเลือกจังหวัด';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'กรุณาระบุรหัสไปรษณีย์';
    else if (!/^[0-9]{5}$/.test(formData.postalCode)) newErrors.postalCode = 'รหัสไปรษณีย์ต้อง 5 หลัก';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-xl p-4 mb-4 space-y-4">
      <h3 className="font-medium text-gray-800">
        {address ? 'แก้ไขที่อยู่' : 'เพิ่มที่อยู่ใหม่'}
      </h3>

      {/* Label */}
      <div className="flex gap-2">
        {[
          { value: 'home', label: 'บ้าน' },
          { value: 'work', label: 'ที่ทำงาน' },
          { value: 'other', label: 'อื่นๆ' },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, label: option.value }))}
            className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-colors
              ${formData.label === option.value
                ? 'border-primary-600 bg-primary-50 text-primary-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          label="ชื่อผู้รับ"
          value={formData.fullName}
          onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
          error={errors.fullName}
          required
        />
        <Input
          label="เบอร์โทรศัพท์"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          error={errors.phone}
          placeholder="เช่น 0812345678"
          required
        />
        <div className="sm:col-span-2">
          <Input
            label="ที่อยู่"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            error={errors.address}
            placeholder="เช่น 99/99 ซอยสุขุมวิท 45 แขวงพระโขนง เขตคลองเตย"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">จังหวัด *</label>
          <select
            value={formData.city}
            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
            className={`w-full px-4 py-3 border rounded-lg ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">เลือกจังหวัด</option>
            {PROVINCES.map((province) => (
              <option key={province} value={province}>{province}</option>
            ))}
          </select>
          {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
        </div>
        <Input
          label="รหัสไปรษณีย์"
          value={formData.postalCode}
          onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
          error={errors.postalCode}
          placeholder="เช่น 10110"
          required
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={formData.isDefault}
          onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
          className="rounded text-primary-600 focus:ring-primary-500"
        />
        <span className="text-sm text-gray-700">ตั้งเป็นที่อยู่ค่าเริ่มต้น</span>
      </label>

      <div className="flex gap-3">
        <Button type="button" variant="ghost" onClick={onCancel}>ยกเลิก</Button>
        <Button type="submit" isLoading={isSubmitting}>บันทึกที่อยู่</Button>
      </div>
    </form>
  );
}

