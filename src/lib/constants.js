// Brand options
export const BRANDS = [
  { value: 'Apex', label: 'Apex' },
  { value: 'Titan', label: 'Titan' },
  { value: 'Raptor', label: 'Raptor' },
  { value: 'Kansei', label: 'Kansei' },
];

// Stud types
export const STUD_TYPES = [
  { value: 'FG', label: 'FG (Firm Ground)', description: 'สนามหญ้าธรรมชาติ' },
  { value: 'AG', label: 'AG (Artificial Ground)', description: 'สนามหญ้าเทียม' },
  { value: 'HG', label: 'HG (Hard Ground)', description: 'สนามแข็ง/ดิน' },
  { value: 'SG', label: 'SG (Soft Ground)', description: 'สนามหญ้าเปียก/นุ่ม' },
];

// Categories
export const CATEGORIES = [
  { value: 'Speed', label: 'Speed', description: 'เน้นความเร็ว' },
  { value: 'Control', label: 'Control', description: 'เน้นการควบคุมบอล' },
  { value: 'Power', label: 'Power', description: 'เน้นการยิง' },
  { value: 'Classic', label: 'Classic', description: 'ทั่วไป' },
];

// Size options (CM sizes)
export const SIZES = [
  24.0, 24.5, 25.0, 25.5, 26.0, 26.5, 27.0, 27.5, 28.0, 28.5, 29.0, 29.5, 30.0
];

// Sort options
export const SORT_OPTIONS = [
  { value: '-createdAt', label: 'ใหม่ล่าสุด' },
  { value: 'createdAt', label: 'เก่าสุด' },
  { value: 'price', label: 'ราคา: ต่ำ → สูง' },
  { value: '-price', label: 'ราคา: สูง → ต่ำ' },
  { value: '-rating', label: 'คะแนนสูงสุด' },
  { value: 'name', label: 'ชื่อ: A → Z' },
];

// Price ranges
export const PRICE_RANGES = [
  { value: '0-2000', label: 'ต่ำกว่า ฿2,000', min: 0, max: 2000 },
  { value: '2000-4000', label: '฿2,000 - ฿4,000', min: 2000, max: 4000 },
  { value: '4000-6000', label: '฿4,000 - ฿6,000', min: 4000, max: 6000 },
  { value: '6000-10000', label: '฿6,000 - ฿10,000', min: 6000, max: 10000 },
  { value: '10000-', label: 'มากกว่า ฿10,000', min: 10000, max: null },
];

// Order statuses
export const ORDER_STATUSES = {
  pending: { label: 'รอดำเนินการ', color: 'yellow' },
  confirmed: { label: 'ยืนยันแล้ว', color: 'blue' },
  processing: { label: 'กำลังเตรียมสินค้า', color: 'blue' },
  shipped: { label: 'จัดส่งแล้ว', color: 'purple' },
  delivered: { label: 'ส่งถึงแล้ว', color: 'green' },
  cancelled: { label: 'ยกเลิก', color: 'red' },
};

// Payment methods
export const PAYMENT_METHODS = [
  { value: 'credit_card', label: 'บัตรเครดิต/เดบิต', icon: 'CreditCard' },
  { value: 'bank_transfer', label: 'โอนเงินผ่านธนาคาร', icon: 'Building' },
  { value: 'promptpay', label: 'PromptPay', icon: 'QrCode' },
  { value: 'cod', label: 'เก็บเงินปลายทาง', icon: 'Truck' },
];

// Thai provinces 
export const PROVINCES = [
  'กรุงเทพมหานคร',
  'กระบี่',
  'กาญจนบุรี',
  'กาฬสินธุ์',
  'กำแพงเพชร',
  'ขอนแก่น',
  'จันทบุรี',
  'ฉะเชิงเทรา',
  'ชลบุรี',
  'ชัยนาท',
  'ชัยภูมิ',
  'ชุมพร',
  'เชียงราย',
  'เชียงใหม่',
  'ตรัง',
  'ตราด',
  'ตาก',
  'นครนายก',
  'นครปฐม',
  'นครพนม',
  'นครราชสีมา',
  'นครศรีธรรมราช',
  'นครสวรรค์',
  'นนทบุรี',
  'นราธิวาส',
  'น่าน',
  'บึงกาฬ',
  'บุรีรัมย์',
  'ปทุมธานี',
  'ประจวบคีรีขันธ์',
  'ปราจีนบุรี',
  'ปัตตานี',
  'พระนครศรีอยุธยา',
  'พะเยา',
  'พังงา',
  'พัทลุง',
  'พิจิตร',
  'พิษณุโลก',
  'เพชรบุรี',
  'เพชรบูรณ์',
  'แพร่',
  'ภูเก็ต',
  'มหาสารคาม',
  'มุกดาหาร',
  'แม่ฮ่องสอน',
  'ยโสธร',
  'ยะลา',
  'ร้อยเอ็ด',
  'ระนอง',
  'ระยอง',
  'ราชบุรี',
  'ลพบุรี',
  'ลำปาง',
  'ลำพูน',
  'เลย',
  'ศรีสะเกษ',
  'สกลนคร',
  'สงขลา',
  'สตูล',
  'สมุทรปราการ',
  'สมุทรสงคราม',
  'สมุทรสาคร',
  'สระแก้ว',
  'สระบุรี',
  'สิงห์บุรี',
  'สุโขทัย',
  'สุพรรณบุรี',
  'สุราษฎร์ธานี',
  'สุรินทร์',
  'หนองคาย',
  'หนองบัวลำภู',
  'อ่างทอง',
  'อำนาจเจริญ',
  'อุดรธานี',
  'อุตรดิตถ์',
  'อุทัยธานี',
  'อุบลราชธานี',
];

// Free shipping threshold
export const FREE_SHIPPING_THRESHOLD = 2000;

// Shipping cost
export const SHIPPING_COST = 50;

