import Order from '../models/order.model.js';
import { HttpError } from '../utils/errors.js';
import {
  CUSTOMER_CANCELLABLE, ORDER_TRANSITIONS, isObjectId, isString,
  mergeOrderItems, validateShippingAddress
} from '../utils/validate.js';
import { priceOrderLines, calculateTotal, reserveStock, releaseStock } from '../services/order.service.js';

export const createOrder = async (req, res) => {
  const lines = mergeOrderItems(req.body.items);
  const shippingAddress = validateShippingAddress(req.body.shippingAddress);

  const items = await priceOrderLines(lines);
  const totalAmount = calculateTotal(items);

  const expected = Number(req.body.totalAmount);
  if (req.body.totalAmount !== undefined && Number.isFinite(expected) && Math.abs(expected - totalAmount) > 0.01) {
    throw new HttpError(409, 'Prices have changed since you added items to your cart. Please review your cart.', {
      code: 'PRICE_CHANGED',
      totalAmount
    });
  }

  await reserveStock(items);

  try {
    const order = await Order.create({
      userId: req.user._id,
      items,
      shippingAddress,
      totalAmount,
      paymentMethod: 'COD',
      status: 'Placed'
    });
    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    await releaseStock(items);
    throw error;
  }
};

export const getUserOrders = async (req, res) => {
  const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(200);
  res.json(orders);
};

export const getOrder = async (req, res) => {
  if (!isObjectId(req.params.id)) throw new HttpError(404, 'Order not found');
  const order = await Order.findOne({ _id: req.params.id, userId: req.user._id });
  if (!order) throw new HttpError(404, 'Order not found');
  res.json(order);
};

export const cancelOrder = async (req, res) => {
  if (!isObjectId(req.params.id)) throw new HttpError(404, 'Order not found');

  const order = await Order.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id, status: { $in: CUSTOMER_CANCELLABLE } },
    { status: 'Cancelled' },
    { new: true }
  );

  if (!order) {
    const exists = await Order.exists({ _id: req.params.id, userId: req.user._id });
    if (!exists) throw new HttpError(404, 'Order not found');
    throw new HttpError(409, 'This order can no longer be cancelled');
  }

  await releaseStock(order.items);
  res.json(order);
};

export const listAllOrders = async (req, res) => {
  const { status } = req.query;
  const filter = isString(status) && ORDER_TRANSITIONS[status] ? { status } : {};
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 50, 1), 100);
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('userId', 'name email'),
    Order.countDocuments(filter)
  ]);

  res.set('X-Total-Count', String(total));
  res.json(orders);
};

export const updateOrderStatus = async (req, res) => {
  if (!isObjectId(req.params.id)) throw new HttpError(404, 'Order not found');
  const { status } = req.body;
  if (!isString(status) || !ORDER_TRANSITIONS[status]) throw new HttpError(400, 'Invalid status');

  const allowedFrom = Object.keys(ORDER_TRANSITIONS).filter((from) => ORDER_TRANSITIONS[from].includes(status));
  const order = await Order.findOneAndUpdate(
    { _id: req.params.id, status: { $in: allowedFrom } },
    { status },
    { new: true }
  ).populate('userId', 'name email');

  if (!order) {
    const existing = await Order.findById(req.params.id).select('status');
    if (!existing) throw new HttpError(404, 'Order not found');
    throw new HttpError(409, `Cannot change an order from ${existing.status} to ${status}`);
  }

  if (status === 'Cancelled') await releaseStock(order.items);
  res.json(order);
};
