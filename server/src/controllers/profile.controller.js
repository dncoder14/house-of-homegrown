import User from '../models/user.model.js';
import { HttpError } from '../utils/errors.js';
import { cleanString, isString, normalizePhone, validatePassword } from '../utils/validate.js';

const MAX_ADDRESSES = 10;
const ADDRESS_TYPES = ['home', 'work', 'other'];

const buildAddress = (body, partial = false) => {
  const fields = {
    fullName: cleanString(body.fullName, 100),
    addressLine1: cleanString(body.addressLine1, 200),
    addressLine2: cleanString(body.addressLine2, 200),
    city: cleanString(body.city, 100),
    state: cleanString(body.state, 100),
    pincode: cleanString(body.pincode, 6)
  };
  const result = {};

  for (const key of ['fullName', 'addressLine1', 'city', 'state', 'pincode']) {
    if (body[key] === undefined && partial) continue;
    if (!fields[key]) throw new HttpError(400, `${key} is required`);
    result[key] = fields[key];
  }
  if (body.addressLine2 !== undefined) result.addressLine2 = fields.addressLine2;
  if (result.pincode !== undefined && !/^\d{6}$/.test(result.pincode)) {
    throw new HttpError(400, 'Pincode must be 6 digits');
  }
  if (body.phone !== undefined || !partial) {
    const phone = normalizePhone(body.phone);
    if (!phone) throw new HttpError(400, 'Enter a valid 10-digit phone number');
    result.phone = phone;
  }
  if (body.type !== undefined) {
    if (!ADDRESS_TYPES.includes(body.type)) throw new HttpError(400, 'Invalid address type');
    result.type = body.type;
  }
  return result;
};

export const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
};

export const updateProfile = async (req, res) => {
  const { name, phone, currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  if (newPassword !== undefined && newPassword !== '') {
    if (!isString(currentPassword) || !currentPassword) {
      throw new HttpError(400, 'Current password required to change password');
    }
    if (!(await user.comparePassword(currentPassword))) {
      throw new HttpError(400, 'Current password is incorrect');
    }
    validatePassword(newPassword);
    user.password = newPassword;
  }

  if (name !== undefined) {
    const cleaned = cleanString(name, 100);
    if (!cleaned) throw new HttpError(400, 'Name cannot be empty');
    user.name = cleaned;
  }
  if (phone !== undefined && phone !== '') {
    const normalized = normalizePhone(phone);
    if (!normalized) throw new HttpError(400, 'Enter a valid 10-digit phone number');
    user.phone = normalized;
  }

  await user.save();
  res.json(await User.findById(user._id).select('-password'));
};

export const addAddress = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user.addresses.length >= MAX_ADDRESSES) {
    throw new HttpError(400, `You can save up to ${MAX_ADDRESSES} addresses`);
  }

  const address = buildAddress(req.body);
  const isDefault = Boolean(req.body.isDefault) || user.addresses.length === 0;
  if (isDefault) user.addresses.forEach((addr) => { addr.isDefault = false; });

  user.addresses.push({ ...address, isDefault });
  await user.save();
  res.status(201).json(user.addresses);
};

export const updateAddress = async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.addressId);
  if (!address) throw new HttpError(404, 'Address not found');

  const updates = buildAddress(req.body, true);
  if (req.body.isDefault === true) {
    user.addresses.forEach((addr) => { addr.isDefault = false; });
    updates.isDefault = true;
  }

  address.set(updates);
  await user.save();
  res.json(user.addresses);
};

export const deleteAddress = async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.addressId);
  if (!address) throw new HttpError(404, 'Address not found');

  const wasDefault = address.isDefault;
  user.addresses.pull(req.params.addressId);
  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();
  res.json(user.addresses);
};

export const getAddresses = async (req, res) => {
  const user = await User.findById(req.user._id).select('addresses');
  res.json(user.addresses);
};
