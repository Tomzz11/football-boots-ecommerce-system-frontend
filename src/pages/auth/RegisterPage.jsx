
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    const result = await registerUser({
      name: data.name,
      email: data.email,
      password: data.password,
    });
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">⚽</span>
            </div>
            <span className="font-display font-bold text-2xl text-gray-800">
              Football Cleats
            </span>
          </Link>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-display font-bold text-gray-800 text-center mb-2">
            สร้างบัญชีใหม่
          </h1>
          <p className="text-gray-500 text-center mb-8">
            สมัครสมาชิกเพื่อรับสิทธิพิเศษมากมาย
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="ชื่อ"
              type="text"
              placeholder="ชื่อของคุณ"
              leftIcon={<User className="w-5 h-5" />}
              error={errors.name?.message}
              {...register('name', {
                required: 'กรุณากรอกชื่อ',
                minLength: {
                  value: 2,
                  message: 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร',
                },
              })}
            />

            <Input
              label="อีเมล"
              type="email"
              placeholder="your@email.com"
              leftIcon={<Mail className="w-5 h-5" />}
              error={errors.email?.message}
              {...register('email', {
                required: 'กรุณากรอกอีเมล',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'รูปแบบอีเมลไม่ถูกต้อง',
                },
              })}
            />

            <div className="relative">
              <Input
                label="รหัสผ่าน"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                leftIcon={<Lock className="w-5 h-5" />}
                error={errors.password?.message}
                {...register('password', {
                  required: 'กรุณากรอกรหัสผ่าน',
                  minLength: {
                    value: 6,
                    message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-10 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <Input
              label="ยืนยันรหัสผ่าน"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              leftIcon={<Lock className="w-5 h-5" />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'กรุณายืนยันรหัสผ่าน',
                validate: (value) =>
                  value === password || 'รหัสผ่านไม่ตรงกัน',
              })}
            />

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded text-primary-600 focus:ring-primary-500 mt-1"
                {...register('acceptTerms', {
                  required: 'กรุณายอมรับเงื่อนไขการใช้งาน',
                })}
              />
              <span className="text-sm text-gray-600">
                ฉันยอมรับ{' '}
                <Link to="/terms" className="text-primary-600 hover:underline">
                  เงื่อนไขการใช้งาน
                </Link>{' '}
                และ{' '}
                <Link to="/privacy" className="text-primary-600 hover:underline">
                  นโยบายความเป็นส่วนตัว
                </Link>
              </span>
            </label>
            {errors.acceptTerms && (
              <p className="text-sm text-red-500">{errors.acceptTerms.message}</p>
            )}

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
            >
              สมัครสมาชิก
            </Button>
          </form>

          {/* Login Link */}
          <p className="mt-8 text-center text-gray-600">
            มีบัญชีอยู่แล้ว?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

