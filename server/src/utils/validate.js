import { HttpError } from './errors.js';

export const CATEGORIES = ['clothing', 'home', 'accessories'];
export const GENDERS = ['men', 'women', 'kids', 'unisex'];
export const MAX_ORDER_LINES = 50;
export const MAX_LINE_QUANTITY = 20;

const OBJECT_ID = /^[a-f\d]{24}$/i;

export const isString = (v) => typeof v === 'string';

export const cleanString = (v, max = 500) => (isString(v) ? v.trim().slice(0, max) : '');

export const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const isObjectId = (v) => isString(v) && OBJECT_ID.test(v);

export const normalizeEmail = (v) => cleanString(v, 254).toLowerCase();

export const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export const validatePassword = (password) => {
  if (!isString(password) || password.length < 8) {
    throw new HttpError(400, 'Password must be at least 8 characters');
  }
  if (password.length > 128) {
    throw new HttpError(400, 'Password is too long');
  }
};

export const normalizePhone = (v) => {
  if (!isString(v) && typeof v !== 'number') return null;
  let digits = String(v).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return /^\d{10}$/.test(digits) ? digits : null;
};

export const validateShippingAddress = (address) => {
  if (!address || typeof address !== 'object') {
    throw new HttpError(400, 'Shipping address is required');
  }
  const cleaned = {
    name: cleanString(address.name, 100),
    street: cleanString(address.street, 300),
    city: cleanString(address.city, 100),
    state: cleanString(address.state, 100),
    pincode: cleanString(address.pincode, 6)
  };
  for (const [key, value] of Object.entries(cleaned)) {
    if (!value) throw new HttpError(400, `Shipping address: ${key} is required`);
  }
  if (!/^\d{6}$/.test(cleaned.pincode)) {
    throw new HttpError(400, 'Pincode must be 6 digits');
  }
  const phone = normalizePhone(address.phone);
  if (!phone) throw new HttpError(400, 'Enter a valid 10-digit phone number');
  return { ...cleaned, phone };
};

export const mergeOrderItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new HttpError(400, 'Order items are required');
  }
  if (items.length > MAX_ORDER_LINES) {
    throw new HttpError(400, `An order can have at most ${MAX_ORDER_LINES} items`);
  }
  const lines = new Map();
  for (const item of items) {
    const productId = item?.productId;
    const quantity = Number(item?.quantity);
    const size = cleanString(item?.size, 30);
    if (!isObjectId(productId)) throw new HttpError(400, 'Invalid product in order');
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_LINE_QUANTITY) {
      throw new HttpError(400, `Quantity must be between 1 and ${MAX_LINE_QUANTITY}`);
    }
    const key = `${productId}|${size}`;
    const existing = lines.get(key);
    const total = (existing?.quantity || 0) + quantity;
    if (total > MAX_LINE_QUANTITY) {
      throw new HttpError(400, `Quantity must be between 1 and ${MAX_LINE_QUANTITY}`);
    }
    lines.set(key, { productId, size, quantity: total });
  }
  return [...lines.values()];
};

export const parseSizes = (raw) => {
  let sizes = raw;
  if (isString(raw)) {
    try {
      sizes = JSON.parse(raw);
    } catch {
      throw new HttpError(400, 'Sizes must be valid JSON');
    }
  }
  if (!Array.isArray(sizes) || sizes.length === 0) {
    throw new HttpError(400, 'At least one size is required for clothing');
  }
  const seen = new Set();
  return sizes.map((entry) => {
    const size = cleanString(entry?.size, 30);
    const stock = Number(entry?.stock);
    if (!size) throw new HttpError(400, 'Every size needs a name');
    if (!Number.isInteger(stock) || stock < 0) {
      throw new HttpError(400, `Stock for size "${size}" must be a whole number, 0 or more`);
    }
    const key = size.toLowerCase();
    if (seen.has(key)) throw new HttpError(400, `Duplicate size "${size}"`);
    seen.add(key);
    return { size, stock };
  });
};

export const parseStock = (raw) => {
  const stock = Number(raw);
  if (raw === '' || raw === undefined || raw === null || !Number.isInteger(stock) || stock < 0) {
    throw new HttpError(400, 'Stock must be a whole number, 0 or more');
  }
  return stock;
};

export const parsePrice = (raw) => {
  const price = Number(raw);
  if (raw === '' || raw === undefined || raw === null || !Number.isFinite(price) || price < 0) {
    throw new HttpError(400, 'Price must be a number, 0 or more');
  }
  return Math.round(price * 100) / 100;
};

export const ORDER_TRANSITIONS = {
  Placed: ['Processing', 'Cancelled'],
  Processing: ['Shipped', 'Cancelled'],
  Shipped: ['Delivered'],
  Delivered: [],
  Cancelled: []
};

export const CUSTOMER_CANCELLABLE = ['Placed', 'Processing'];
