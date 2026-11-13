# House of Homegrown - D2C Ecommerce Platform

A full-stack D2C ecommerce website for sustainable, premium Indian products built with React, Node.js, Express, and MongoDB.

## Features

### Frontend
- **React + Vite** with modern UI components
- **shadcn/ui + Tailwind CSS** for premium design
- **Responsive design** with mobile-first approach
- **Earthy color palette** (cream, beige, sage, terracotta)
- **Product catalog** with server-side search, filters, sorting and pagination
- **Size selection** for clothing, with per-size stock
- **Shopping cart** with localStorage persistence, re-validated against live prices and stock
- **User authentication** with JWT (expired sessions are detected and logged out)
- **Order management**: history, tracking, and customer cancellation
- **Admin dashboard** (`/admin`, admins only): products, inventory and order status
- **Static pages** (About, Contact, FAQ, Privacy, Terms, Shipping)

### Backend
- **Node.js + Express** with strict MVC architecture
- **MongoDB** for users, products, orders (product images on Cloudinary)
- **JWT authentication** with bcrypt hashing, `user`/`admin` roles, and login rate limiting
- **Server-authoritative orders**: prices come from the database, stock is reserved atomically, and cancelling returns stock
- **Hardening**: helmet, Mongo operator sanitising, input validation, request size and rate limits
- **RESTful API** with consistent JSON errors and a `/api/health` endpoint

### Pages
- Home (hero, categories, featured products)
- Shop (product listing with filters)
- Product Details (image gallery, add to cart)
- Cart (item management, quantity updates)
- Checkout (address form, COD payment)
- Orders (order history and details)
- Authentication (login/signup)
- Static pages (About, Contact, FAQ, etc.)

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, shadcn/ui, React Router
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Authentication**: JWT, bcrypt
- **Styling**: Tailwind CSS with custom earthy theme
- **Icons**: Lucide React

## Project Structure

```
ecommerce/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React contexts
│   │   ├── utils/         # API utilities
│   │   └── lib/           # Utility functions
│   └── package.json
├── server/                # Express backend
│   ├── src/
│   │   ├── config/        # Database configuration
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Custom middleware
│   │   ├── services/      # Business logic (order pricing, stock)
│   │   ├── utils/         # Validation helpers, errors, jwt
│   │   ├── scripts/       # seed + make-admin scripts
│   │   └── tests/         # unit + integration tests
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### 1. Clone and Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Environment Configuration

**Server (.env)**
```bash
cd server
cp .env.example .env
```

Edit `server/.env` (see `server/.env.example`). `MONGODB_URI`, `JWT_SECRET` and the three
`CLOUDINARY_*` values are required; the server will not start without them. In production
`FRONTEND_URL` is required too.

**Client (.env)**
```bash
cd client
cp .env.example .env
```

Edit `client/.env`:
```
VITE_API_URL=http://localhost:5000/api
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:
```bash
# For local MongoDB
mongod

# Or use MongoDB Atlas cloud connection
```

### 4. Run the Application

**Start Backend Server:**
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

**Start Frontend (in new terminal):**
```bash
cd client
npm run dev
# Client runs on http://localhost:5173
```

### 5. Create an admin

Sign up on the site, then promote that account:
```bash
cd server
npm run make-admin -- you@example.com
```

### 6. Run the tests
```bash
cd server
npm test                  # unit tests
npm run test:integration  # end-to-end API tests (downloads an in-memory MongoDB on first run)
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration (password min 8 characters)
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Current user (validates the token)

### Products (public)
- `GET /api/products` - List products. Query: `search`, `category`, `subcategory`, `minPrice`, `maxPrice`, `sort` (`price_low`, `price_high`, `newest`), `ids`, `page`, `limit` (max 100). Total count is in the `X-Total-Count` header.
- `GET /api/products/:id` - Single product
- `GET /api/products/categories` - Category list
- `GET /api/subcategories` - Subcategories

### Profile (protected)
- `GET/PUT /api/profile`
- `GET/POST /api/profile/addresses`, `PUT/DELETE /api/profile/addresses/:id`

### Orders (protected)
- `POST /api/orders` - Place an order. Send `items: [{ productId, size?, quantity }]`, `shippingAddress`, and the expected `totalAmount`. Prices and stock are checked server-side (`409` if prices changed or stock ran out).
- `GET /api/orders`, `GET /api/orders/:id`
- `PATCH /api/orders/:id/cancel` - Cancel while `Placed` or `Processing`

### Admin (admin role required)
- `POST /api/admin/products`, `PUT /api/admin/products/:id`, `DELETE /api/admin/products/:id`
- `GET /api/admin/orders`, `PATCH /api/admin/orders/:id/status`
- `POST/PUT/DELETE /api/subcategories`

### Other
- `GET /api/health`

## Product Data

Products live in MongoDB and are managed from `/admin`. For local development,
`CONFIRM_WIPE=true npm run seed:products` loads sample data (this **deletes all existing products** and refuses to run in production).

Clothing products carry `sizes: [{ size, stock }]`; all other products carry a single `stock`.

## Key Features

### Authentication
- JWT-based authentication
- Protected routes for cart/checkout/orders
- Persistent login state

### Shopping Cart
- localStorage persistence, one line per product and size
- Quantities capped at available stock
- Refreshed from the server on the cart and checkout pages

### Order Management
- COD (Cash on Delivery) only. There is no online payment gateway yet.
- Statuses: Placed, Processing, Shipped, Delivered, Cancelled (admins move orders forward)
- Customers can cancel before an order ships; stock is restored

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interactions
- Accessible components

## Design System

### Colors
- **Cream**: #F5F1EB (backgrounds)
- **Beige**: #E8DCC0 (secondary backgrounds)
- **Sage**: #9CAF88 (accents)
- **Terracotta**: #C17B5A (primary actions)
- **Brown**: #8B4513 (text, headers)

### Typography
- Clean, minimal fonts
- Proper hierarchy
- Readable line heights
- Responsive sizing

## Development

### Code Standards
- Clean, readable implementations
- Proper error handling
- MVC architecture separation
- RESTful API design

### Build Commands
```bash
# Frontend build
cd client
npm run build

# Backend production
cd server
npm start
```

## Deployment Notes

1. Set production environment variables
2. Build frontend assets
3. Configure MongoDB connection
4. Set up proper CORS origins
5. Use process manager (PM2) for backend
6. Serve frontend through web server (Nginx)

## Support

For questions or issues, contact: hello@houseofhomegrown.com
