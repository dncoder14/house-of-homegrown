import Subcategory from '../models/subcategory.model.js';
import { uploadImages, deleteImages } from '../config/cloudinary.js';
import { HttpError } from '../utils/errors.js';
import { CATEGORIES, cleanString, isObjectId, isString } from '../utils/validate.js';

const slugify = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const getSubcategories = async (req, res) => {
  const { category } = req.query;
  const filter = isString(category) && category ? { category } : {};
  res.json(await Subcategory.find(filter));
};

export const createSubcategory = async (req, res) => {
  const name = cleanString(req.body.name, 100);
  const { category } = req.body;
  if (!name) throw new HttpError(400, 'Name is required');
  if (!CATEGORIES.includes(category)) throw new HttpError(400, 'Invalid category');
  if (!req.file) throw new HttpError(400, 'Image is required');

  const [image] = await uploadImages([req.file]);
  try {
    const subcategory = await Subcategory.create({ name, category, slug: slugify(name), image });
    res.status(201).json(subcategory);
  } catch (error) {
    await deleteImages([image.publicId]);
    throw error;
  }
};

export const updateSubcategory = async (req, res) => {
  if (!isObjectId(req.params.id)) throw new HttpError(404, 'Subcategory not found');
  const subcategory = await Subcategory.findById(req.params.id);
  if (!subcategory) throw new HttpError(404, 'Subcategory not found');

  if (req.body.name !== undefined) {
    const name = cleanString(req.body.name, 100);
    if (!name) throw new HttpError(400, 'Name cannot be empty');
    subcategory.name = name;
    subcategory.slug = slugify(name);
  }
  if (req.body.category !== undefined) {
    if (!CATEGORIES.includes(req.body.category)) throw new HttpError(400, 'Invalid category');
    subcategory.category = req.body.category;
  }

  const oldPublicId = subcategory.image.publicId;
  let newImage = null;
  if (req.file) {
    [newImage] = await uploadImages([req.file]);
    subcategory.image = newImage;
  }

  try {
    await subcategory.save();
  } catch (error) {
    if (newImage) await deleteImages([newImage.publicId]);
    throw error;
  }

  if (newImage) await deleteImages([oldPublicId]);
  res.json(subcategory);
};

export const deleteSubcategory = async (req, res) => {
  if (!isObjectId(req.params.id)) throw new HttpError(404, 'Subcategory not found');
  const subcategory = await Subcategory.findByIdAndDelete(req.params.id);
  if (!subcategory) throw new HttpError(404, 'Subcategory not found');

  await deleteImages([subcategory.image.publicId]);
  res.json({ message: 'Subcategory deleted successfully' });
};
