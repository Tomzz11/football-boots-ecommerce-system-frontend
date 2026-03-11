import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Upload, X, Image as ImageIcon } from 'lucide-react';
import api from '../../lib/axios';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Loading';
import toast from 'react-hot-toast';
import { BRANDS, STUD_TYPES, CATEGORIES, GRADES } from '../../lib/constants';

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    grade: '',
    studType: '',
    category: '',
    description: '',
    price: '',
    comparePrice: '',
    isFeatured: false,
    sizes: [
      { size: 25.0, stock: 0 },
      { size: 25.5, stock: 0 },
      { size: 26.0, stock: 0 },
      { size: 26.5, stock: 0 },
      { size: 27.0, stock: 0 },
      { size: 27.5, stock: 0 },
      { size: 28.0, stock: 0 },
    ],
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load product data for edit
  const { data: product, isLoading } = useQuery({
    queryKey: ['admin', 'product', id],
    queryFn: async () => {
      const res = await api.get(`/products/${id}`);
      return res.data?.product || res.product || res.data;
    },
    enabled: isEdit,
  });

  useEffect(() => {
    if (product && isEdit) {
      setFormData({
        name: product.name || '',
        brand: product.brand || '',
        grade: product.grade || '',
        studType: product.studType || '',
        category: product.category || '',
        description: product.description || '',
        price: product.price || '',
        comparePrice: product.comparePrice || '',
        isFeatured: product.isFeatured || false,
        sizes: product.sizes?.length > 0
          ? product.sizes.map(s => ({ size: s.size, stock: s.stock }))
          : formData.sizes,
      });
      setExistingImages(product.images || []);
    }
  }, [product]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleSizeChange = (index, field, value) => {
    setFormData(prev => {
      const sizes = [...prev.sizes];
      sizes[index] = { ...sizes[index], [field]: Number(value) };
      return { ...prev, sizes };
    });
  };

  const addSize = () => {
    setFormData(prev => ({
      ...prev,
      sizes: [...prev.sizes, { size: 0, stock: 0 }],
    }));
  };

  const removeSize = (index) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index),
    }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(f => {
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`${f.name} มีขนาดเกิน 5MB`);
        return false;
      }
      return true;
    });
    setImageFiles(prev => [...prev, ...validFiles]);
  };

  const removeNewImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imageId) => {
    if (!window.confirm('ต้องการลบรูปนี้หรือไม่?')) return;
    try {
      await api.delete(`/products/${id}/images/${imageId}`);
      setExistingImages(prev => prev.filter(img => img._id !== imageId));
      toast.success('ลบรูปสำเร็จ');
    } catch (err) {
      toast.error('ลบรูปไม่สำเร็จ');
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'กรุณาระบุชื่อสินค้า';
    if (!formData.brand) newErrors.brand = 'กรุณาเลือกแบรนด์';
    if (!formData.grade) newErrors.grade = 'กรุณาเลือกเกรด';
    if (!formData.studType) newErrors.studType = 'กรุณาเลือกประเภทปุ่ม';
    if (!formData.category) newErrors.category = 'กรุณาเลือกหมวดหมู่';
    if (!formData.description.trim()) newErrors.description = 'กรุณาระบุรายละเอียด';
    if (!formData.price || formData.price <= 0) newErrors.price = 'กรุณาระบุราคา';
    if (!isEdit && imageFiles.length === 0 && existingImages.length === 0) {
      newErrors.images = 'กรุณาเพิ่มรูปสินค้าอย่างน้อย 1 รูป';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const submitData = {
        ...formData,
        price: Number(formData.price),
        comparePrice: formData.comparePrice ? Number(formData.comparePrice) : undefined,
        sizes: formData.sizes.filter(s => s.size > 0),
      };

      let productId = id;

      if (isEdit) {
        await api.put(`/products/${id}`, submitData);
        toast.success('แก้ไขสินค้าสำเร็จ');
      } else {
        // For new product, include placeholder image if uploading
        if (imageFiles.length > 0) {
          submitData.images = [{ url: 'placeholder', public_id: 'placeholder', isPrimary: true }];
        }
        const res = await api.post('/products', submitData);
        productId = res.data?.product?._id || res.product?._id || res.data?._id;
        toast.success('สร้างสินค้าสำเร็จ');
      }

      // Upload images if any
      if (imageFiles.length > 0 && productId) {
        const formDataImg = new FormData();
        imageFiles.forEach(file => formDataImg.append('images', file));

        try {
          await api.post(`/products/${productId}/images`, formDataImg, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } catch (imgErr) {
          toast.error('อัปโหลดรูปบางส่วนไม่สำเร็จ');
        }
      }

      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      navigate('/admin/products');
    } catch (err) {
      const message = err.response?.data?.message || 'เกิดข้อผิดพลาด';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEdit && isLoading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/admin/products')} className="p-2 hover:bg-gray-200 rounded-lg">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-gray-800">
          {isEdit ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4">ข้อมูลพื้นฐาน</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="ชื่อสินค้า"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                error={errors.name}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">แบรนด์ *</label>
              <select value={formData.brand} onChange={(e) => handleChange('brand', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg ${errors.brand ? 'border-red-500' : 'border-gray-300'}`}>
                <option value="">เลือกแบรนด์</option>
                {BRANDS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
              {errors.brand && <p className="mt-1 text-sm text-red-500">{errors.brand}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">เกรด *</label>
              <select value={formData.grade} onChange={(e) => handleChange('grade', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg ${errors.grade ? 'border-red-500' : 'border-gray-300'}`}>
                <option value="">เลือกเกรด</option>
                {GRADES.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
              {errors.grade && <p className="mt-1 text-sm text-red-500">{errors.grade}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ประเภทปุ่ม *</label>
              <select value={formData.studType} onChange={(e) => handleChange('studType', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg ${errors.studType ? 'border-red-500' : 'border-gray-300'}`}>
                <option value="">เลือกประเภทปุ่ม</option>
                {STUD_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              {errors.studType && <p className="mt-1 text-sm text-red-500">{errors.studType}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">หมวดหมู่ *</label>
              <select value={formData.category} onChange={(e) => handleChange('category', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg ${errors.category ? 'border-red-500' : 'border-gray-300'}`}>
                <option value="">เลือกหมวดหมู่</option>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">รายละเอียด *</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg resize-none ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4">ราคา</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="ราคาขาย (บาท)"
              type="number"
              value={formData.price}
              onChange={(e) => handleChange('price', e.target.value)}
              error={errors.price}
              required
            />
            <Input
              label="ราคาเดิม (บาท) - ไม่บังคับ"
              type="number"
              value={formData.comparePrice}
              onChange={(e) => handleChange('comparePrice', e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 mt-4 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) => handleChange('isFeatured', e.target.checked)}
              className="rounded text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">แสดงในสินค้าแนะนำ</span>
          </label>
        </div>

        {/* Sizes */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">ไซส์และสต็อก</h3>
            <Button type="button" variant="outline" size="sm" onClick={addSize}>
              <Plus className="w-4 h-4" /> เพิ่มไซส์
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {formData.sizes.map((size, index) => (
              <div key={index} className="border rounded-lg p-3 relative">
                <button type="button" onClick={() => removeSize(index)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                  ×
                </button>
                <label className="text-xs text-gray-500">ไซส์ (CM)</label>
                <input
                  type="number"
                  step="0.5"
                  value={size.size}
                  onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                  className="w-full border-b py-1 text-center font-medium focus:outline-none"
                />
                <label className="text-xs text-gray-500 mt-2 block">สต็อก</label>
                <input
                  type="number"
                  value={size.stock}
                  onChange={(e) => handleSizeChange(index, 'stock', e.target.value)}
                  className="w-full border-b py-1 text-center focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4">รูปภาพสินค้า</h3>

          {/* Existing images */}
          {existingImages.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-4">
              {existingImages.map((img) => (
                <div key={img._id} className="relative w-24 h-24">
                  <img src={img.url} alt="" className="w-full h-full object-cover rounded-lg" />
                  {img.isPrimary && (
                    <span className="absolute top-1 left-1 text-xs bg-primary-600 text-white px-1 rounded">หลัก</span>
                  )}
                  <button type="button" onClick={() => removeExistingImage(img._id)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* New images preview */}
          {imageFiles.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-4">
              {imageFiles.map((file, i) => (
                <div key={i} className="relative w-24 h-24">
                  <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover rounded-lg" />
                  <span className="absolute top-1 left-1 text-xs bg-blue-600 text-white px-1 rounded">ใหม่</span>
                  <button type="button" onClick={() => removeNewImage(i)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload button */}
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">คลิกเพื่ออัปโหลดรูป (สูงสุด 5MB)</span>
            <input type="file" multiple accept="image/*" onChange={handleImageSelect} className="hidden" />
          </label>
          {errors.images && <p className="mt-2 text-sm text-red-500">{errors.images}</p>}
        </div>

        {/* Submit */}
        <div className="flex gap-4 justify-end">
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/products')}>
            ยกเลิก
          </Button>
          <Button type="submit" size="lg" isLoading={isSubmitting}>
            {isEdit ? 'บันทึกการแก้ไข' : 'สร้างสินค้า'}
          </Button>
        </div>
      </form>
    </div>
  );
}

