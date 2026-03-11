import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, Eye, Image } from 'lucide-react';
import api from '../../lib/axios';
import Button from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Loading';
import { formatPrice, getProductImage } from '../../lib/utils';
import GradeBadge from '../../components/product/GradeBadge';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [brandFilter, setBrandFilter] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products', { page, search, brand: brandFilter }],
    queryFn: async () => {
      const params = new URLSearchParams({ page, limit: 10 });
      if (search) params.set('search', search);
      if (brandFilter) params.set('brand', brandFilter);
      const res = await api.get(`/products?${params}`);
      return res;
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (productId) => {
      await api.delete(`/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success('ลบสินค้าสำเร็จ');
    },
    onError: () => {
      toast.error('ลบสินค้าไม่สำเร็จ');
    },
  });

  const products = data?.data || data?.products || [];
  const pagination = data?.pagination || {};

  const handleDelete = (product) => {
    if (window.confirm(`ต้องการลบ "${product.name}" หรือไม่?`)) {
      deleteProduct.mutate(product._id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-800">สินค้าทั้งหมด ({pagination.total || 0})</h2>
        <Link to="/admin/products/new">
          <Button leftIcon={<Plus className="w-4 h-4" />}>เพิ่มสินค้า</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาสินค้า..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={brandFilter}
          onChange={(e) => { setBrandFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">ทุกแบรนด์</option>
          <option value="Apex">Apex</option>
          <option value="Titan">Titan</option>
          <option value="Raptor">Raptor</option>
          <option value="Kansei">Kansei</option>
        </select>
      </div>

      {/* Products Table */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">ไม่พบสินค้า</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">สินค้า</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">แบรนด์</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">เกรด</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">ราคา</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">สต็อก</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">สถานะ</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getProductImage(product.images)}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-800 line-clamp-1">{product.name}</p>
                          <p className="text-xs text-gray-400">{product.studType} • {product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{product.brand}</td>
                    <td className="py-3 px-4"><GradeBadge grade={product.grade} /></td>
                    <td className="py-3 px-4 font-medium">{formatPrice(product.price)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium
                        ${product.totalStock === 0 ? 'bg-red-100 text-red-700' :
                          product.totalStock <= 10 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'}`}>
                        {product.totalStock} คู่
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium
                        ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {product.isActive ? 'ใช้งาน' : 'ปิดการขาย'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/products/${product.slug || product._id}`} target="_blank"
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link to={`/admin/products/${product._id}/edit`}
                          className="p-2 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product)}
                          className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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

