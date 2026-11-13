import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  escapeRegex, mergeOrderItems, normalizePhone, parseSizes, parsePrice,
  parseStock, validateShippingAddress, validatePassword, ORDER_TRANSITIONS
} from '../utils/validate.js';
import { calculateTotal } from '../services/order.service.js';

const ID = 'a'.repeat(24);
const ID2 = 'b'.repeat(24);

test('escapeRegex neutralises regex metacharacters', () => {
  assert.equal(new RegExp(escapeRegex('a.b(c)*')).test('a.b(c)*'), true);
  assert.equal(new RegExp(escapeRegex('a.b')).test('axb'), false);
});

test('mergeOrderItems merges duplicates and rejects bad input', () => {
  const merged = mergeOrderItems([
    { productId: ID, quantity: 2, size: 'M' },
    { productId: ID, quantity: 1, size: 'M' },
    { productId: ID, quantity: 1, size: 'L' },
    { productId: ID2, quantity: 1 }
  ]);
  assert.equal(merged.length, 3);
  assert.equal(merged.find((l) => l.productId === ID && l.size === 'M').quantity, 3);
  assert.throws(() => mergeOrderItems([]), /required/);
  assert.throws(() => mergeOrderItems([{ productId: 'nope', quantity: 1 }]), /Invalid product/);
  assert.throws(() => mergeOrderItems([{ productId: ID, quantity: 0 }]), /Quantity/);
  assert.throws(() => mergeOrderItems([{ productId: ID, quantity: -3 }]), /Quantity/);
  assert.throws(() => mergeOrderItems([{ productId: ID, quantity: 1.5 }]), /Quantity/);
  assert.throws(() => mergeOrderItems([{ productId: { $ne: null }, quantity: 1 }]), /Invalid product/);
});

test('normalizePhone accepts Indian formats only', () => {
  assert.equal(normalizePhone('98765 43210'), '9876543210');
  assert.equal(normalizePhone('+91 98765-43210'), '9876543210');
  assert.equal(normalizePhone('12345'), null);
  assert.equal(normalizePhone({ $gt: '' }), null);
});

test('validateShippingAddress requires all fields and a 6-digit pincode', () => {
  const good = { name: 'A', phone: '9876543210', street: 's', city: 'c', state: 'st', pincode: '110001' };
  assert.equal(validateShippingAddress(good).pincode, '110001');
  assert.throws(() => validateShippingAddress({ ...good, pincode: '123' }), /Pincode/);
  assert.throws(() => validateShippingAddress({ ...good, city: '' }), /city/);
  assert.throws(() => validateShippingAddress(null), /required/);
});

test('parseSizes validates and de-duplicates', () => {
  assert.deepEqual(parseSizes('[{"size":"M","stock":"3"}]'), [{ size: 'M', stock: 3 }]);
  assert.throws(() => parseSizes('not json'), /valid JSON/);
  assert.throws(() => parseSizes([]), /At least one/);
  assert.throws(() => parseSizes([{ size: 'M', stock: -1 }]), /whole number/);
  assert.throws(() => parseSizes([{ size: 'M', stock: 1 }, { size: 'm', stock: 2 }]), /Duplicate/);
});

test('stock of 0 is valid, blanks and negatives are not', () => {
  assert.equal(parseStock('0'), 0);
  assert.throws(() => parseStock(''), /Stock/);
  assert.throws(() => parseStock('-1'), /Stock/);
  assert.throws(() => parseStock('2.5'), /Stock/);
});

test('parsePrice rejects negatives and non-numbers', () => {
  assert.equal(parsePrice('199.999'), 200);
  assert.throws(() => parsePrice('-1'), /Price/);
  assert.throws(() => parsePrice('abc'), /Price/);
});

test('validatePassword enforces length', () => {
  assert.throws(() => validatePassword('short'), /8 characters/);
  assert.throws(() => validatePassword({ a: 1 }), /8 characters/);
  assert.doesNotThrow(() => validatePassword('longenough'));
});

test('calculateTotal uses server prices', () => {
  assert.equal(calculateTotal([{ price: 100.5, quantity: 2 }, { price: 10, quantity: 1 }]), 211);
});

test('order status machine has no way out of terminal states', () => {
  assert.deepEqual(ORDER_TRANSITIONS.Delivered, []);
  assert.deepEqual(ORDER_TRANSITIONS.Cancelled, []);
  assert.ok(ORDER_TRANSITIONS.Placed.includes('Cancelled'));
  assert.ok(!ORDER_TRANSITIONS.Shipped.includes('Cancelled'));
});
