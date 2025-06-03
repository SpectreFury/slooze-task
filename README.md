# Slooze - Food Delivery App

A comprehensive food delivery application built with Next.js, featuring role-based access control, order management, and secure payment processing.

## 🍕 Features

### Core Functionality
- **Restaurant Browsing**: Browse and search through various restaurants
- **Menu Management**: View detailed menu items with categories and pricing
- **Shopping Cart**: Add/remove items with persistent state management
- **Order Placement**: Complete checkout with payment and delivery information
- **Order Tracking**: Real-time order status updates and history

### Security & Access Control
- **Role-Based Access Control (RBAC)**: Three user roles with different permissions
  - **Members**: Browse restaurants, view menus, add to cart
  - **Managers**: All member permissions + place orders, manage restaurants, cancel orders
  - **Admins**: All permissions including user management and system settings
- **Secure Authentication**: JWT-based authentication with cookie storage
- **Protected Routes**: API endpoints and pages protected by role-based permissions

### Payment & Data Management
- **Payment Information Saving**: Users can save payment details for future orders
- **Auto-populate Payment**: Saved payment information auto-loads on checkout
- **Order Cancellation**: Managers and admins can cancel orders with proper validation
- **Data Persistence**: MongoDB integration for reliable data storage

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with cookie-based sessions
- **State Management**: Zustand for cart management
- **Form Handling**: Native React forms with validation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database (local or cloud)
- npm/yarn/pnpm

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd slooze-task
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Environment Setup**
Create a `.env.local` file in the root directory:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Run the development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. **Open your browser**
Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
app/
├── api/                    # API routes
│   ├── auth/              # Authentication endpoints
│   ├── orders/            # Order management
│   ├── payment-info/      # Payment data handling
│   └── restaurants/       # Restaurant data
├── cart/                  # Shopping cart page
├── checkout/              # Checkout process
├── dashboard/             # User dashboard
├── login/                 # Authentication pages
├── orders/                # Order management pages
└── restaurants/           # Restaurant browsing

components/
└── ui/                    # Reusable UI components

lib/
├── auth.ts               # Authentication utilities
├── rbac.ts               # Role-based access control
├── mongoose.ts           # Database connection
├── models/               # Database schemas
└── store/                # State management
```

## 🔐 User Roles & Permissions

### Member (Customer)
- ✅ Browse restaurants and menus
- ✅ Add items to cart
- ✅ View own order history
- ❌ Cannot place orders (checkout restricted)
- ❌ Cannot cancel orders

### Manager (Restaurant Manager)
- ✅ All member permissions
- ✅ Access checkout and place orders
- ✅ Manage restaurant information
- ✅ View restaurant orders
- ✅ Cancel orders
- ❌ Cannot manage users or system settings

### Admin (System Administrator)
- ✅ All manager permissions
- ✅ Manage users and system settings
- ✅ View all orders across the platform
- ✅ Full system access

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/me` - Get current user info

### Orders
- `GET /api/orders` - Fetch user orders
- `POST /api/orders` - Create new order
- `PATCH /api/orders` - Cancel order (managers/admins only)

### Payment
- `GET /api/payment-info` - Get saved payment info
- `POST /api/payment-info` - Save payment information

### Restaurants
- `GET /api/restaurants` - Get all restaurants
- `GET /api/restaurants/[id]` - Get specific restaurant

## 🎯 Key Features Walkthrough

### 1. Role-Based Checkout Access
Only managers and admins can access the checkout page. Members see a restriction message with their role limitation.

### 2. Payment Information Persistence
Users can save their payment details during checkout with a checkbox. This information is securely stored and auto-populated on future visits.

### 3. Order Management Dashboard
The dashboard shows real-time order statistics, recent orders, and quick actions based on user role.

### 4. Order Cancellation
Managers and admins can cancel orders that are not yet delivered. The system prevents cancellation of completed or already cancelled orders.

### 5. Secure Data Handling
- Passwords are hashed before storage
- JWT tokens are used for session management
- Sensitive payment information is handled securely
- API endpoints are protected with proper authorization

## 🧪 Development Notes

### Database Models
- **User**: Stores user information, roles, and saved payment data
- **Restaurant**: Restaurant details, menus, and verification status
- **Order**: Complete order information with status tracking

### State Management
- Cart state is managed using Zustand for persistence across sessions
- User authentication state is handled through API calls and cookies

### Security Considerations
- All API routes include authentication checks
- Role-based permissions are enforced at both frontend and backend
- Sensitive operations require additional permission validation

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
The app can be deployed on any platform that supports Next.js applications.

## 📝 License

This project is private and proprietary.
