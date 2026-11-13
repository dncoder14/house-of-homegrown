import { MongoMemoryServer } from 'mongodb-memory-server';
const mongod = await MongoMemoryServer.create();
process.env.MONGODB_URI = mongod.getUri('shop');
process.env.JWT_SECRET = 'x'.repeat(40);
process.env.NODE_ENV = 'test';
process.env.CLOUDINARY_CLOUD_NAME = 'x';
const { default: mongoose } = await import('mongoose');
const { default: app } = await import('../app.js');
const { default: Product } = await import('../models/product.model.js');
const { default: User } = await import('../models/user.model.js');
await mongoose.connect(process.env.MONGODB_URI);
const server = app.listen(0);
const base = `http://localhost:${server.address().port}/api`;
let pass = 0, fail = 0;
const req = async (method, path, { token, body } = {}) => {
  const r = await fetch(base + path, { method, headers: { 'content-type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  let json; try { json = await r.json(); } catch {}
  return { status: r.status, json, headers: r.headers };
};
const check = (name, cond, extra = '') => { cond ? pass++ : fail++; console.log(cond ? 'PASS' : 'FAIL', name, cond ? '' : extra); };

const img = [{ url: 'http://x/y.png', publicId: 'p' }];
const kurta = await Product.create({ title: 'Kurta', price: 1000, category: 'clothing', subcategory: 'Kurtas', gender: 'men', sizes: [{ size: 'M', stock: 3 }, { size: 'L', stock: 1 }], images: img, description: 'd' });
const spice = await Product.create({ title: 'Chili', price: 50, category: 'home', subcategory: 'spices', stock: 5, images: img, description: 'd' });
const free = await Product.create({ title: 'Saree', price: 8000, category: 'clothing', subcategory: 'sarees', gender: 'women', sizes: [{ size: 'Free Size', stock: 2 }], images: img, description: 'd' });
check('subcategory normalised to lowercase', kurta.subcategory === 'kurtas');

const a = await req('POST', '/auth/signup', { body: { name: 'Alice', email: ' Alice@Example.com ', password: 'password1' } });
check('signup ok, role user', a.status === 201 && a.json.user.role === 'user', JSON.stringify(a.json));
check('short password rejected', (await req('POST', '/auth/signup', { body: { name: 'B', email: 'b@x.com', password: '123456' } })).status === 400);
check('dup email (diff case) 409', (await req('POST', '/auth/signup', { body: { name: 'A', email: 'ALICE@example.com', password: 'password1' } })).status === 409);
check('login wrong pw 401', (await req('POST', '/auth/login', { body: { email: 'alice@example.com', password: 'nope' } })).status === 401);
const login = await req('POST', '/auth/login', { body: { email: 'ALICE@example.com', password: 'password1' } });
const tok = login.json.token;
check('login ok', login.status === 200 && !!tok);
check('/auth/me', (await req('GET', '/auth/me', { token: tok })).json?.user?.email === 'alice@example.com');

// admin gating
check('normal user blocked from admin orders (403)', (await req('GET', '/admin/orders', { token: tok })).status === 403);
check('normal user blocked from admin product delete (403)', (await req('DELETE', `/admin/products/${kurta._id}`, { token: tok })).status === 403);
check('product still exists', !!(await Product.findById(kurta._id)));

// listing
let r = await req('GET', '/products?limit=2&page=1');
check('pagination + X-Total-Count', r.json.length === 2 && r.headers.get('x-total-count') === '3');
r = await req('GET', '/products?subcategory=KURTAS');
check('subcategory filter case-insens', r.json.length === 1);
r = await req('GET', '/products?category[$ne]=home');
check('operator injection neutralised (no crash, no bypass)', r.status === 200 && r.json.length <= 3);
r = await req('GET', '/products?search=.*');
check('regex search escaped (0 matches)', r.json.length === 0);
r = await req('GET', '/products?minPrice=100&maxPrice=2000&sort=price_high');
check('price filter + sort', r.json.length === 1 && r.json[0].title === 'Kurta');
r = await req('GET', `/products?ids=${kurta._id},${spice._id},bad`);
check('ids filter', r.json.length === 2);

const addr = { name: 'Alice', phone: '98765 43210', street: '1 Road', city: 'Pune', state: 'MH', pincode: '411001' };
const order = (items, extra = {}) => req('POST', '/orders', { token: tok, body: { items, shippingAddress: addr, ...extra } });
const stock = async () => ({ k: (await Product.findById(kurta._id)).sizes.map(s => s.stock), s: (await Product.findById(spice._id)).stock });

// price tampering
r = await order([{ productId: String(kurta._id), size: 'M', quantity: 1, price: 1, title: 'hax' }], { totalAmount: 1 });
check('tampered total -> 409 PRICE_CHANGED', r.status === 409 && r.json.code === 'PRICE_CHANGED' && r.json.totalAmount === 1000, JSON.stringify(r.json));
check('no stock taken on rejected order', JSON.stringify(await stock()) === JSON.stringify({ k: [3, 1], s: 5 }));

r = await order([{ productId: String(kurta._id), quantity: 1 }]);
check('clothing without size -> 400 SIZE_REQUIRED', r.status === 400 && r.json.code === 'SIZE_REQUIRED', JSON.stringify(r.json));
r = await order([{ productId: String(free._id), quantity: 1 }]);
check('single-size item auto-selects', r.status === 201 && r.json.order.items[0].size === 'Free Size', JSON.stringify(r.json));

r = await order([{ productId: String(kurta._id), size: 'M', quantity: 2 }, { productId: String(spice._id), quantity: 2 }], { totalAmount: 2100 });
check('valid order 201, server-priced', r.status === 201 && r.json.order.totalAmount === 2100 && r.json.order.shippingAddress.phone === '9876543210', JSON.stringify(r.json));
const orderId = r.json.order._id;
check('stock decremented (size M 3->1, chili 5->3)', JSON.stringify(await stock()) === JSON.stringify({ k: [1, 1], s: 3 }), JSON.stringify(await stock()));

// atomic rollback: second line fails -> first line's stock restored
r = await order([{ productId: String(spice._id), quantity: 1 }, { productId: String(kurta._id), size: 'M', quantity: 5 }]);
check('insufficient stock 409', r.status === 409 && r.json.code === 'INSUFFICIENT_STOCK', JSON.stringify(r.json));
check('no partial reservation left behind', JSON.stringify(await stock()) === JSON.stringify({ k: [1, 1], s: 3 }), JSON.stringify(await stock()));

// bad inputs
check('negative qty 400', (await order([{ productId: String(spice._id), quantity: -2 }])).status === 400);
check('fake product id 400', (await order([{ productId: 'f'.repeat(24), quantity: 1 }])).status === 409);
check('bad pincode 400', (await req('POST', '/orders', { token: tok, body: { items: [{ productId: String(spice._id), quantity: 1 }], shippingAddress: { ...addr, pincode: '1' } } })).status === 400);

// concurrency: 10 parallel buyers for the last 1 unit of size L
const results = await Promise.all(Array.from({ length: 10 }, () => order([{ productId: String(kurta._id), size: 'L', quantity: 1 }])));
const ok = results.filter(x => x.status === 201).length;
check('10 concurrent orders for 1 unit -> exactly 1 succeeds (no oversell)', ok === 1, `ok=${ok}`);
check('stock never negative', (await stock()).k[1] === 0);

// cancel restores stock; double cancel blocked
r = await req('PATCH', `/orders/${orderId}/cancel`, { token: tok });
check('customer cancel ok', r.status === 200 && r.json.status === 'Cancelled');
check('stock restored after cancel', JSON.stringify(await stock()) === JSON.stringify({ k: [3, 0], s: 5 }), JSON.stringify(await stock()));
check('double cancel -> 409', (await req('PATCH', `/orders/${orderId}/cancel`, { token: tok })).status === 409);
check('stock not double-restored', (await stock()).s === 5);

// other user can't see/cancel
await req('POST', '/auth/signup', { body: { name: 'Bob', email: 'bob@x.com', password: 'password2' } });
const bt = (await req('POST', '/auth/login', { body: { email: 'bob@x.com', password: 'password2' } })).json.token;
check("other user can't read order (404)", (await req('GET', `/orders/${orderId}`, { token: bt })).status === 404);
check("other user can't cancel order (404)", (await req('PATCH', `/orders/${orderId}/cancel`, { token: bt })).status === 404);
check('bad order id 404 not 500', (await req('GET', '/orders/xyz', { token: tok })).status === 404);

// admin flow
await User.updateOne({ email: 'alice@example.com' }, { role: 'admin' });
const o2 = (await order([{ productId: String(spice._id), quantity: 1 }])).json.order;
r = await req('GET', '/admin/orders', { token: tok });
check('admin lists orders w/ user populated', r.status === 200 && r.json.length >= 2 && r.json[0].userId.email, JSON.stringify(r.json?.[0]?.userId));
check('illegal transition Placed->Delivered 409', (await req('PATCH', `/admin/orders/${o2._id}/status`, { token: tok, body: { status: 'Delivered' } })).status === 409);
check('Placed->Processing ok', (await req('PATCH', `/admin/orders/${o2._id}/status`, { token: tok, body: { status: 'Processing' } })).status === 200);
check('Processing->Shipped ok', (await req('PATCH', `/admin/orders/${o2._id}/status`, { token: tok, body: { status: 'Shipped' } })).status === 200);
check('customer cancel after shipped blocked (409)', (await req('PATCH', `/orders/${o2._id}/cancel`, { token: tok })).status === 409);
check('invalid status 400', (await req('PATCH', `/admin/orders/${o2._id}/status`, { token: tok, body: { status: 'Bogus' } })).status === 400);
const o3 = (await order([{ productId: String(spice._id), quantity: 2 }])).json.order;
const before = (await stock()).s;
await req('PATCH', `/admin/orders/${o3._id}/status`, { token: tok, body: { status: 'Cancelled' } });
check('admin cancel restores stock', (await stock()).s === before + 2);

// admin product updates (no cloudinary: JSON/no files path)
r = await req('PUT', `/admin/products/${spice._id}`, { token: tok, body: { stock: 0 } });
check('admin can set stock to 0', r.status === 200 && r.json.stock === 0, JSON.stringify(r.json));
r = await req('PUT', `/admin/products/${spice._id}`, { token: tok, body: { rating: 5, images: [], category: 'clothing', stock: -4 } });
check('negative stock rejected', r.status === 400);
r = await req('PUT', `/admin/products/${spice._id}`, { token: tok, body: { rating: 5, category: 'clothing', title: 'Chili 2' } });
const p = await Product.findById(spice._id);
check('mass-assignment ignored (rating/category unchanged), title updated', p.rating === 0 && p.category === 'home' && p.title === 'Chili 2');
r = await order([{ productId: String(spice._id), quantity: 1 }]);
check('out-of-stock product cannot be ordered', r.status === 409 && /out of stock/.test(r.json.message), JSON.stringify(r.json));

// profile
r = await req('POST', '/profile/addresses', { token: bt, body: { fullName: 'Bob', phone: '9999999999', addressLine1: 'x', city: 'c', state: 's', pincode: '400001', isAdmin: true, _id: 'zzz' } });
check('add address ok', r.status === 201 && r.json.length === 1 && r.json[0].isDefault);
r = await req('PUT', `/profile/addresses/${r.json[0]._id}`, { token: bt, body: { city: 'Mumbai', _id: 'hack' } });
check('update address partial ok, _id untouched', r.status === 200 && r.json[0].city === 'Mumbai' && r.json[0]._id !== 'hack', JSON.stringify(r.json));
r = await req('PUT', '/profile', { token: bt, body: { role: 'admin', name: 'Bobby' } });
check('profile update cannot escalate role', r.status === 200 && (await User.findOne({ email: 'bob@x.com' })).role === 'user');
r = await req('PUT', '/profile', { token: bt, body: { currentPassword: 'password2', newPassword: 'abc' } });
check('weak new password rejected', r.status === 400);

console.log(`\n${pass} passed, ${fail} failed`);
server.close(); await mongoose.disconnect(); await mongod.stop();
process.exit(fail ? 1 : 0);
