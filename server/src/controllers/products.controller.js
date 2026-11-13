import Product from '../models/product.model.js';
import { uploadImages, deleteImages } from '../config/cloudinary.js';
import { HttpError } from '../utils/errors.js';
import {
  CATEGORIES, GENDERS, cleanString, escapeRegex, isObjectId, isString,
  parsePrice, parseSizes, parseStock
} from '../utils/validate.js';

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 100;

const SORTS = {
  price_low: { price: 1, _id: 1 },
  'price-asc': { price: 1, _id: 1 },
  price_high: { price: -1, _id: 1 },
  'price-desc': { price: -1, _id: 1 },
  newest: { createdAt: -1, _id: 1 }
};

const toPositiveInt = (value, fallback, max) => {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(n, max);
};

export const getProducts = async (req, res) => {
  const { search, category, subcategory, sort, minPrice, maxPrice, ids } = req.query;
  const filter = {};

  if (isString(category) && category) filter.category = category;
  if (isString(subcategory) && subcategory) filter.subcategory = subcategory.trim().toLowerCase();

  if (isString(search) && search.trim()) {
    const pattern = new RegExp(escapeRegex(search.trim().slice(0, 100)), 'i');
    filter.$or = [{ title: pattern }, { description: pattern }];
  }

  const price = {};
  if (isString(minPrice) && minPrice !== '' && Number.isFinite(Number(minPrice))) price.$gte = Number(minPrice);
  if (isString(maxPrice) && maxPrice !== '' && Number.isFinite(Number(maxPrice))) price.$lte = Number(maxPrice);
  if (Object.keys(price).length) filter.price = price;

  if (isString(ids) && ids) {
    const list = ids.split(',').filter(isObjectId).slice(0, 100);
    filter._id = { $in: list };
  }

  const limit = toPositiveInt(req.query.limit, DEFAULT_LIMIT, MAX_LIMIT);
  const page = toPositiveInt(req.query.page, 1, 10000);

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(SORTS[sort] || { createdAt: -1, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter)
  ]);

  res.set('X-Total-Count', String(total));
  res.json(products);
};

export const getProduct = async (req, res) => {
  if (!isObjectId(req.params.id)) throw new HttpError(404, 'Product not found');
  const product = await Product.findById(req.params.id);
  if (!product) throw new HttpError(404, 'Product not found');
  res.json(product);
};

export const createProduct = async (req, res) => {
  const body = req.body;
  const category = body.category;
  if (!CATEGORIES.includes(category)) throw new HttpError(400, 'Invalid category');

  const productData = {
    title: cleanString(body.title, 200),
    price: parsePrice(body.price),
    category,
    subcategory: cleanString(body.subcategory, 100).toLowerCase(),
    description: cleanString(body.description, 5000)
  };
  if (!productData.title) throw new HttpError(400, 'Title is required');
  if (!productData.subcategory) throw new HttpError(400, 'Subcategory is required');
  if (!productData.description) throw new HttpError(400, 'Description is required');

  if (category === 'clothing') {
    if (!GENDERS.includes(body.gender)) throw new HttpError(400, 'Gender is required for clothing');
    productData.gender = body.gender;
    productData.sizes = parseSizes(body.sizes);
  } else {
    productData.stock = parseStock(body.stock);
  }

  const images = await uploadImages(req.files);
  try {
    const product = await Product.create({ ...productData, images });
    res.status(201).json(product);
  } catch (error) {
    await deleteImages(images.map((img) => img.publicId));
    throw error;
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  if (!isObjectId(id)) throw new HttpError(404, 'Product not found');

  const product = await Product.findById(id);
  if (!product) throw new HttpError(404, 'Product not found');

  const body = req.body;
  if (body.title !== undefined) {
    product.title = cleanString(body.title, 200);
    if (!product.title) throw new HttpError(400, 'Title cannot be empty');
  }
  if (body.description !== undefined) {
    product.description = cleanString(body.description, 5000);
    if (!product.description) throw new HttpError(400, 'Description cannot be empty');
  }
  if (body.subcategory !== undefined) {
    product.subcategory = cleanString(body.subcategory, 100).toLowerCase();
    if (!product.subcategory) throw new HttpError(400, 'Subcategory cannot be empty');
  }
  if (body.price !== undefined) product.price = parsePrice(body.price);

  if (product.category === 'clothing') {
    if (body.gender !== undefined) {
      if (!GENDERS.includes(body.gender)) throw new HttpError(400, 'Invalid gender');
      product.gender = body.gender;
    }
    if (body.sizes !== undefined) product.sizes = parseSizes(body.sizes);
  } else if (body.stock !== undefined) {
    product.stock = parseStock(body.stock);
  }

  const oldPublicIds = product.images.map((img) => img.publicId);
  let newImages = [];
  if (req.files && req.files.length > 0) {
    newImages = await uploadImages(req.files);
    product.images = newImages;
  }

  try {
    await product.save();
  } catch (error) {
    await deleteImages(newImages.map((img) => img.publicId));
    throw error;
  }

  if (newImages.length > 0) await deleteImages(oldPublicIds);
  res.json(product);
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  if (!isObjectId(id)) throw new HttpError(404, 'Product not found');

  const product = await Product.findByIdAndDelete(id);
  if (!product) throw new HttpError(404, 'Product not found');

  await deleteImages(product.images.map((img) => img.publicId));
  res.json({ message: 'Product deleted successfully' });
};

export const getCategoriesList = async (req, res) => {
  res.json(CATEGORIES);
};
