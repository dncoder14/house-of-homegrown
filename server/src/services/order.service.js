import Product from '../models/product.model.js';
import { HttpError } from '../utils/errors.js';

const lineLabel = (line) => (line.size ? `${line.title} (${line.size})` : line.title);

export const priceOrderLines = async (lines) => {
  const ids = [...new Set(lines.map((l) => l.productId))];
  const products = await Product.find({ _id: { $in: ids } });
  const byId = new Map(products.map((p) => [String(p._id), p]));

  return lines.map((line) => {
    const product = byId.get(line.productId);
    if (!product) {
      throw new HttpError(409, 'An item in your cart is no longer available', { code: 'ITEM_UNAVAILABLE' });
    }

    let size = '';
    let available;
    if (product.category === 'clothing') {
      const sizes = product.sizes || [];
      const match = line.size
        ? sizes.find((s) => s.size.toLowerCase() === line.size.toLowerCase())
        : sizes.length === 1 ? sizes[0] : null;
      if (!match) {
        throw new HttpError(400, `Please select a size for ${product.title}`, { code: 'SIZE_REQUIRED' });
      }
      size = match.size;
      available = match.stock;
    } else {
      available = product.stock || 0;
    }

    const priced = {
      productId: String(product._id),
      title: product.title,
      price: product.price,
      quantity: line.quantity,
      size,
      imageUrl: product.images?.[0]?.url || ''
    };

    if (available < line.quantity) {
      const message = available === 0
        ? `${lineLabel(priced)} is out of stock`
        : `Only ${available} of ${lineLabel(priced)} left in stock`;
      throw new HttpError(409, message, { code: 'INSUFFICIENT_STOCK' });
    }
    return priced;
  });
};

export const calculateTotal = (items) =>
  Math.round(items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100) / 100;

const stockUpdate = (item, direction) => {
  const qty = item.quantity * direction;
  if (item.size) {
    return Product.updateOne(
      {
        _id: item.productId,
        category: 'clothing',
        sizes: { $elemMatch: { size: item.size, ...(direction < 0 ? { stock: { $gte: item.quantity } } : {}) } }
      },
      { $inc: { 'sizes.$.stock': qty } }
    );
  }
  return Product.updateOne(
    { _id: item.productId, ...(direction < 0 ? { stock: { $gte: item.quantity } } : {}) },
    { $inc: { stock: qty } }
  );
};

export const releaseStock = async (items) => {
  await Promise.allSettled(items.map((item) => stockUpdate(item, 1)));
};

export const reserveStock = async (items) => {
  const reserved = [];
  for (const item of items) {
    const result = await stockUpdate(item, -1);
    if (result.modifiedCount !== 1) {
      await releaseStock(reserved);
      throw new HttpError(409, `${lineLabel(item)} just went out of stock`, { code: 'INSUFFICIENT_STOCK' });
    }
    reserved.push(item);
  }
};
