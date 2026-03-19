import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Warehouse, AlertTriangle, Plus, Minus, Search,
  Package, TrendingDown, RefreshCw
} from 'lucide-react';
import api from '../../lib/axios';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Loading';
import { formatDateTime, getProductImage } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function AdminInventory() {
  const [activeTab, setActiveTab] = useState('overview'); // overview, low-stock, history
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockAction, setStockAction] = useState(null); // 'add' or 'adjust'
  const queryClient = useQueryClient();

  const tabs = [
    { value: 'overview', label: 'ภาพรวมสต็อก', icon: Warehouse },
    { value: 'low-stock', label: 'สต็อกต่ำ', icon: AlertTriangle },
    { value: 'out-of-stock', label: 'หมดสต็อก', icon: TrendingDown },
    { value: 'history', label: 'ประวัติ', icon: RefreshCw },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">จัดการสต็อก</h2>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                ${activeTab === tab.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border'}`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'overview' && <StockOverview search={search} setSearch={setSearch}
        onAddStock={(product) => { setSelectedProduct(product); setStockAction('add'); }}
        onAdjustStock={(product) => { setSelectedProduct(product); setStockAction('adjust'); }}
      />}
      {activeTab === 'low-stock' && <LowStockList />}
      {activeTab === 'out-of-stock' && <OutOfStockList />}
      {activeTab === 'history' && <InventoryHistory />}

      {/* Stock Modal */}
      {selectedProduct && stockAction && (
        <StockModal
          product={selectedProduct}
          action={stockAction}
          onClose={() => { setSelectedProduct(null); setStockAction(null); }}
        />
      )}
    </div>
  );
}

// ============================================
// Stock Overview
// ============================================
function StockOverview({ search, setSearch, onAddStock, onAdjustStock }) {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'inventory', { page, search }],
    queryFn: async () => {
      const params = new URLSearchParams({ page, limit: 10 });
      if (search) params.set('search', search);
      const res = await api.get(`/products?${params}`);
      return res;
    },
  });

  const products = data?.data || data?.products || [];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาสินค้า..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product._id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center gap-4 mb-3">
                <img src={getProductImage(product.images)} alt={product.name}
                  className="w-14 h-14 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.brand} • {product.grade} • สต็อกรวม: {product.totalStock} คู่</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => onAddStock(product)}
                    leftIcon={<Plus className="w-3 h-3" />}>
                    เพิ่มสต็อก
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onAdjustStock(product)}
                    leftIcon={<RefreshCw className="w-3 h-3" />}>
                    ปรับ
                  </Button>
                </div>
              </div>

              {/* Sizes grid */}
              <div className="flex flex-wrap gap-2">
                {product.sizes?.map((s) => {
                  const available = s.stock - (s.reserved || 0);
                  return (
                    <div key={s.size} className={`text-center px-3 py-2 rounded-lg border text-sm
                      ${available === 0 ? 'bg-red-50 border-red-200 text-red-700' :
                        available <= 5 ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                        'bg-green-50 border-green-200 text-green-700'}`}>
                      <p className="font-medium">{s.size}</p>
                      <p className="text-xs">{available} คู่</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// Low Stock List
// ============================================
function LowStockList() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['admin', 'low-stock'],
    queryFn: async () => {
      const res = await api.get('/inventory/low-stock?threshold=5');
      return res.data?.products || res.data || [];
    },
  });

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  if (!products || products.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 text-center">
        <Package className="w-16 h-16 text-green-300 mx-auto mb-4" />
        <p className="text-green-600 font-medium">ไม่มีสินค้าที่สต็อกต่ำ</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 bg-yellow-50 border-b border-yellow-200">
        <p className="text-yellow-800 font-medium flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          พบ {products.length} สินค้าที่สต็อกต่ำ (สต๊อกต่ำคือเหลือ 1 ถึง 5 คู่)
        </p>
      </div>
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
          {products.map((item) =>
            item.lowStockSizes?.map((size, i) => (
              <tr key={`${item._id}-${size.size}`} className="border-b last:border-0 hover:bg-gray-50">
                {i === 0 && (
                  <>
                    <td className="py-3 px-4 font-medium" rowSpan={item.lowStockSizes.length}>{item.name}</td>
                    <td className="py-3 px-4" rowSpan={item.lowStockSizes.length}>{item.brand}</td>
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
  );
}

// ============================================
// Out of Stock List
// ============================================
function OutOfStockList() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['admin', 'out-of-stock'],
    queryFn: async () => {
      const res = await api.get('/inventory/out-of-stock');
      return res.data?.products || res.data || [];
    },
  });

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  if (!products || products.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 text-center">
        <Package className="w-16 h-16 text-green-300 mx-auto mb-4" />
        <p className="text-green-600 font-medium">ไม่มีสินค้าหมดสต็อก</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 bg-red-50 border-b border-red-200">
        <p className="text-red-800 font-medium flex items-center gap-2">
          <TrendingDown className="w-5 h-5" />
          พบ {products.length} สินค้าที่หมดสต็อก
        </p>
      </div>
      <div className="divide-y">
        {products.map((product) => (
          <div key={product._id} className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="font-medium text-gray-800">{product.name}</p>
              <p className="text-sm text-gray-500">{product.brand} • {product.category}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Inventory History
// ============================================
function InventoryHistory() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'inventory-history', page],
    queryFn: async () => {
      const res = await api.get(`/inventory/history?page=${page}&limit=20`);
      return res;
    },
  });

  const logs = data?.data || [];
  const pagination = data?.pagination || {};

  const actionLabels = {
    stock_in: { label: 'รับเข้า', color: 'text-green-600 bg-green-100' },
    sold: { label: 'ขาย', color: 'text-blue-600 bg-blue-100' },
    reserved: { label: 'จอง', color: 'text-purple-600 bg-purple-100' },
    release: { label: 'ปล่อย', color: 'text-orange-600 bg-orange-100' },
    return: { label: 'คืน', color: 'text-cyan-600 bg-cyan-100' },
    adjustment_add: { label: 'ปรับเพิ่ม', color: 'text-green-600 bg-green-100' },
    adjustment_remove: { label: 'ปรับลด', color: 'text-red-600 bg-red-100' },
  };

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left py-3 px-4 font-medium text-gray-500">วันที่</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">สินค้า</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">ไซส์</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">การกระทำ</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">จำนวน</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">หมายเหตุ</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => {
              const action = actionLabels[log.action] || { label: log.action, color: 'text-gray-600 bg-gray-100' };
              return (
                <tr key={log._id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-500 text-xs">{formatDateTime(log.createdAt)}</td>
                  <td className="py-3 px-4 font-medium">{log.productName}</td>
                  <td className="py-3 px-4">{log.size} CM</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${action.color}`}>
                      {action.label}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium">{log.quantity}</td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{log.note || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 p-4 border-t">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium ${
                page === p ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// Stock Modal (Add/Adjust)
// ============================================
function StockModal({ product, action, onClose }) {
  const queryClient = useQueryClient();
  const [sizeQuantities, setSizeQuantities] = useState(
    product.sizes?.map(s => ({ size: s.size, quantity: 0 })) || []
  );
  const [adjustSize, setAdjustSize] = useState('');
  const [adjustStock, setAdjustStock] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [note, setNote] = useState('');

  const addStock = useMutation({
    mutationFn: async () => {
      const filtered = sizeQuantities.filter(s => s.quantity > 0);
      await api.post(`/inventory/${product._id}/add`, { sizeQuantities: filtered, note });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin'], refetchType: 'active' }),
        queryClient.invalidateQueries({ queryKey: ['products'], refetchType: 'active' }),
      ]);
      toast.success('เพิ่มสต็อกสำเร็จ');
      onClose();
    },
    onError: () => toast.error('เพิ่มสต็อกไม่สำเร็จ'),
  });

  const adjustStockMutation = useMutation({
    mutationFn: async () => {
      await api.put(`/inventory/${product._id}/adjust`, {
        size: Number(adjustSize),
        newStock: Number(adjustStock),
        reason: adjustReason,
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin'], refetchType: 'active' }),
        queryClient.invalidateQueries({ queryKey: ['products'], refetchType: 'active' }),
      ]);
        toast.success('ปรับสต็อกสำเร็จ');
        onClose();
      },
    onError: () => toast.error('ปรับสต็อกไม่สำเร็จ'),
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-gray-800 mb-2">
          {action === 'add' ? 'เพิ่มสต็อก' : 'ปรับสต็อก'}
        </h3>
        <p className="text-sm text-gray-500 mb-4">{product.name}</p>

        {action === 'add' ? (
          <>
            <div className="space-y-3 mb-4">
              {sizeQuantities.map((item, i) => (
                <div key={item.size} className="flex items-center gap-3">
                  <span className="w-16 text-sm font-medium">{item.size} CM</span>
                  <span className="text-xs text-gray-400 w-16">
                    (มี {product.sizes?.find(s => s.size === item.size)?.stock || 0})
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={item.quantity}
                    onChange={(e) => {
                      const updated = [...sizeQuantities];
                      updated[i].quantity = Number(e.target.value);
                      setSizeQuantities(updated);
                    }}
                    className="flex-1 px-3 py-2 border rounded-lg text-center"
                    placeholder="จำนวนที่เพิ่ม"
                  />
                </div>
              ))}
            </div>
            <Input
              label="หมายเหตุ"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="เช่น รับสินค้าจาก Supplier"
            />
            <div className="flex gap-3 mt-4">
              <Button variant="ghost" fullWidth onClick={onClose}>ยกเลิก</Button>
              <Button fullWidth onClick={() => addStock.mutate()} isLoading={addStock.isPending}>
                เพิ่มสต็อก
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เลือกไซส์</label>
                <select value={adjustSize} onChange={(e) => setAdjustSize(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg">
                  <option value="">เลือกไซส์</option>
                  {product.sizes?.map(s => (
                    <option key={s.size} value={s.size}>{s.size} CM (มี {s.stock} คู่)</option>
                  ))}
                </select>
              </div>
              <Input
                label="จำนวนสต็อกใหม่"
                type="number"
                value={adjustStock}
                onChange={(e) => setAdjustStock(e.target.value)}
                placeholder="ระบุจำนวนที่ถูกต้อง"
              />
              <Input
                label="เหตุผล"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="เช่น ปรับยอดหลังตรวจนับ"
                required
              />
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" fullWidth onClick={onClose}>ยกเลิก</Button>
              <Button fullWidth onClick={() => adjustStockMutation.mutate()}
                isLoading={adjustStockMutation.isPending}
                disabled={!adjustSize || !adjustStock || !adjustReason.trim()}>
                ปรับสต็อก
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

