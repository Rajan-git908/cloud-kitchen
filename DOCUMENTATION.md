# Cloud Kitchen Food Delivery Application - Comprehensive Documentation

## 📋 Table of Contents
1. [Problem Statement](#problem-statement)
2. [Architecture Overview](#architecture-overview)
3. [System Architecture Diagram](#system-architecture-diagram)
4. [Technology Stack](#technology-stack)
5. [Database Schema](#database-schema)
6. [Backend API Documentation](#backend-api-documentation)
7. [Frontend Component Structure](#frontend-component-structure)
8. [Function Call Flow](#function-call-flow)
9. [Design and Approach](#design-and-approach)
10. [Security Implementation](#security-implementation)
11. [Deployment Guide](#deployment-guide)

---

## 🎯 Problem Statement

### Current Challenges
- **Traditional restaurant limitations**: Physical space constraints, limited seating capacity
- **Order management complexity**: Manual order taking, tracking, and delivery coordination
- **Customer experience**: Limited menu visibility, no real-time order tracking
- **Operational inefficiency**: Manual inventory management, lack of data insights

### Solution Objectives
- **Digital transformation**: Cloud kitchen model with centralized food preparation
- **Streamlined ordering**: User-friendly web interface for menu browsing and ordering
- **Real-time management**: Admin dashboard for order tracking and menu management
- **Enhanced customer experience**: Premium UI/UX with order history and testimonials
- **Scalable architecture**: Modular design supporting future enhancements

---

## 🏗️ Architecture Overview

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                             │
│              (React.js Frontend Application)                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │   Home   │ │   Menu   │ │   Cart   │ │Dashboard │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                          │
│              (Node.js/Express Backend)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │   Auth   │ │   Menu   │ │  Orders  │ │  Admin   │  │
│  │Controller│ │Controller│ │Controller│ │Controller│  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ MySQL Protocol
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
│              (MySQL Database)                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  Users   │ │   Menu   │ │  Orders  │ │Reviews   │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow
```
User Action → Frontend Component → API Call → Backend Controller → Database Query → Response → UI Update
```

---

## 📊 System Architecture Diagram

### Detailed Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React.js)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │  Components  │    │   Context    │    │   Routes     │      │
│  │              │    │              │    │              │      │
│  │ • Home       │    │ • AuthContext│    │ • /          │      │
│  │ • Menu       │    │ • CartContext│    │ • /menu      │      │
│  │ • Cart       │    │              │    │ • /cart      │      │
│  │ • Checkout   │    │              │    │ • /dashboard │      │
│  │ • Login      │    │              │    │ • /admin     │      │
│  │ • Register   │    │              │    │ • /profile   │      │
│  │ • Profile    │    │              │    │              │      │
│  │ • Dashboards │    │              │    │              │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   Styles     │    │   Utils       │    │   Images     │      │
│  │              │    │              │    │              │      │
│  │ • App.css    │    │ • API calls   │    │ • Food images│      │
│  │ • AuthForms  │    │ • Validation  │    │ • Logo       │      │
│  │              │    │              │    │              │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ REST API Calls
                              │ (Axios HTTP Client)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Node.js/Express)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   Routes     │    │  Controllers  │    │  Middleware  │      │
│  │              │    │              │    │              │      │
│  │ • /api/auth  │───▶│ authController│───▶│ verifyToken  │      │
│  │ • /api/menu  │───▶│menuController │───▶│ isAdmin      │      │
│  │ • /api/orders│───▶│orderController│───▶│              │      │
│  │ • /api/admin │───▶│adminController│───▶│              │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   Models     │    │   Config     │    │   Uploads    │      │
│  │              │    │              │    │              │      │
│  │ • db.js      │    │ • .env       │    │ • Multer     │      │
│  │ • menuModel  │    │ • server.js  │    │ • Images     │      │
│  │ • orderModel │    │              │    │              │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ MySQL Queries
                              │ (mysql2 driver)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (MySQL)                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │    Tables    │    │  Relations   │    │   Indexes    │      │
│  │              │    │              │    │              │      │
│  │ • users      │    │ user→orders  │    │ • phone      │      │
│  │ • menu       │    │ menu→category│    │ • id         │      │
│  │ • orders     │    │              │    │ • user_id    │      │
│  │ • categories │    │              │    │ • status     │      │
│  │ • testimonials│   │              │    │              │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend Technologies
- **Framework**: React.js 19.2.8
- **Routing**: React Router DOM 7.18.2
- **State Management**: React Context API
- **HTTP Client**: Axios 1.18.1
- **UI Framework**: Bootstrap 5.3.8, React Bootstrap 2.10.10
- **Animations**: Framer Motion 12.43.0
- **Icons**: React Icons 5.7.0
- **Build Tool**: Create React App (React Scripts 5.0.1)

### Backend Technologies
- **Runtime**: Node.js
- **Framework**: Express.js 5.2.1
- **Database**: MySQL (mysql2 3.23.2)
- **Authentication**: JWT (jsonwebtoken 9.0.3)
- **Password Hashing**: bcrypt 6.0.0
- **File Upload**: Multer 2.2.0
- **Security**: Helmet 8.3.0, CORS 2.8.6
- **Rate Limiting**: express-rate-limit 8.6.1
- **Compression**: compression 1.8.1
- **Validation**: express-validator 7.3.2
- **Environment**: dotenv 17.4.2

### Development Tools
- **Package Manager**: npm
- **Version Control**: Git
- **Code Editor**: VS Code 
- **API Testing**: Postman / cURL
- **Database Management**: MySQL Workbench 

---

## 🗄️ Database Schema

### Tables Structure

#### 1. users
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(15) NOT NULL UNIQUE,
  location VARCHAR(100),
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user'
);
```

**Purpose**: Store user authentication and profile information  
**Indexes**: `phone` (unique), `id` (primary)  
**Relations**: One-to-many with orders

#### 2. food_categories
```sql
CREATE TABLE food_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose**: Define food menu categories  
**Indexes**: `name` (unique), `id` (primary)  
**Relations**: One-to-many with menu items

#### 3. menu
```sql
CREATE TABLE menu (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL DEFAULT 'Main Meals',
  category_id INT NULL,
  is_available TINYINT(1) NOT NULL DEFAULT 1,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES food_categories(id) 
    ON UPDATE CASCADE ON DELETE SET NULL
);
```

**Purpose**: Store menu items with pricing and availability  
**Indexes**: `id` (primary), `category_id` (foreign key)  
**Relations**: Many-to-one with food_categories

#### 4. orders
```sql
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  items TEXT,
  status VARCHAR(20) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Purpose**: Track customer orders and status  
**Indexes**: `id` (primary), `user_id` (foreign key), `status`  
**Relations**: Many-to-one with users

#### 5. testimonials
```sql
CREATE TABLE testimonials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  name VARCHAR(100) NOT NULL,
  text TEXT NOT NULL,
  rating TINYINT NOT NULL DEFAULT 5,
  approved BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose**: Store customer reviews and ratings  
**Indexes**: `id` (primary), `user_id` (foreign key)  
**Relations**: Many-to-one with users

### Entity Relationship Diagram
```
users (1) ───────< (many) orders
  │
  └─── (1) ───────< (many) testimonials

food_categories (1) ───────< (many) menu
```

---

## 🔌 Backend API Documentation

### Authentication Endpoints

#### POST /api/auth/register
**Description**: Register a new user account  
**Request Body**:
```json
{
  "full_name": "John Doe",
  "phone": "1234567890",
  "location": "New York",
  "password": "password123"
}
```
**Response**: 
```json
{
  "message": "User registered successfully"
}
```

#### POST /api/auth/login
**Description**: Authenticate user and receive JWT token  
**Request Body**:
```json
{
  "phone": "1234567890",
  "password": "password123"
}
```
**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "role": "user",
    "name": "John Doe",
    "phone": "1234567890",
    "location": "New York"
  }
}
```

#### GET /api/auth/profile
**Description**: Get user profile information  
**Headers**: `Authorization: Bearer <token>`  
**Response**:
```json
{
  "id": 1,
  "full_name": "John Doe",
  "phone": "1234567890",
  "location": "New York",
  "role": "user"
}
```

#### PUT /api/auth/profile
**Description**: Update user profile  
**Headers**: `Authorization: Bearer <token>`  
**Request Body**:
```json
{
  "full_name": "John Updated",
  "location": "Los Angeles"
}
```
**Response**:
```json
{
  "message": "Profile updated successfully"
}
```

### Menu Endpoints

#### GET /api/menu
**Description**: Get all available menu items  
**Response**:
```json
[
  {
    "id": 1,
    "name": "Spaghetti Carbonara",
    "price": "15.99",
    "description": "Classic Italian pasta",
    "category": "Main Meals",
    "image_url": "/images/spaghetti-1234567890.jpg"
  }
]
```

#### POST /api/menu (Admin)
**Description**: Add new menu item  
**Headers**: `Authorization: Bearer <token>`  
**Request**: `multipart/form-data` with fields: name, price, description, category, image  
**Response**:
```json
{
  "message": "Menu item added successfully"
}
```

#### PUT /api/menu/:id (Admin)
**Description**: Update existing menu item  
**Headers**: `Authorization: Bearer <token>`  
**Request**: `multipart/form-data` with fields: name, price, description, category, image  
**Response**:
```json
{
  "message": "Menu item updated successfully"
}
```

#### DELETE /api/menu/:id (Admin)
**Description**: Delete menu item  
**Headers**: `Authorization: Bearer <token>`  
**Response**:
```json
{
  "message": "Menu item deleted successfully"
}
```

#### PATCH /api/menu/:id/availability (Admin)
**Description**: Toggle menu item visibility  
**Headers**: `Authorization: Bearer <token>`  
**Request Body**:
```json
{
  "is_available": true
}
```
**Response**:
```json
{
  "message": "Menu item shown"
}
```

### Order Endpoints

#### GET /api/orders
**Description**: Get user's order history  
**Headers**: `Authorization: Bearer <token>`  
**Response**:
```json
[
  {
    "id": 1,
    "user_id": 1,
    "total": "45.99",
    "items": "[{\"name\":\"Pizza\",\"quantity\":2}]",
    "status": "Delivered",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

#### POST /api/orders
**Description**: Place new order  
**Headers**: `Authorization: Bearer <token>`  
**Request Body**:
```json
{
  "total": 45.99,
  "items": [
    {"name": "Pizza", "quantity": 2, "price": 15.99},
    {"name": "Salad", "quantity": 1, "price": 14.01}
  ]
}
```
**Response**:
```json
{
  "id": 2,
  "message": "Order placed successfully"
}
```

#### GET /api/orders/admin (Admin)
**Description**: Get all orders (admin view)  
**Headers**: `Authorization: Bearer <token>`  
**Response**: Array of all orders with user details

#### PUT /api/orders/:id/status (Admin)
**Description**: Update order status  
**Headers**: `Authorization: Bearer <token>`  
**Request Body**:
```json
{
  "status": "Preparing"
}
```
**Response**:
```json
{
  "message": "Order status updated"
}
```

### Admin Endpoints

#### GET /api/admin/users (Admin)
**Description**: Get all users  
**Headers**: `Authorization: Bearer <token>`  
**Response**: Array of all users

#### GET /api/admin/testimonials (Admin)
**Description**: Get all testimonials (including unapproved)  
**Headers**: `Authorization: Bearer <token>`  
**Response**: Array of all testimonials

#### PUT /api/admin/testimonials/:id (Admin)
**Description**: Update testimonial approval status  
**Headers**: `Authorization: Bearer <token>`  
**Request Body**:
```json
{
  "approved": true,
  "rating": 5,
  "text": "Updated review text"
}
```
**Response**:
```json
{
  "message": "Review updated"
}
```

#### DELETE /api/admin/testimonials/:id (Admin)
**Description**: Delete testimonial  
**Headers**: `Authorization: Bearer <token>`  
**Response**:
```json
{
  "message": "Review deleted"
}
```

### Testimonial Endpoints

#### GET /api/testimonials
**Description**: Get approved testimonials  
**Response**: Array of approved customer reviews

#### POST /api/testimonials
**Description**: Submit new testimonial  
**Headers**: `Authorization: Bearer <token>`  
**Request Body**:
```json
{
  "name": "John Doe",
  "text": "Great food!",
  "rating": 5
}
```
**Response**:
```json
{
  "id": 1,
  "message": "Review submitted"
}
```

---

## 🎨 Frontend Component Structure

### Component Hierarchy
```
App.js
├── Navbar.js
├── Footer.js
└── Routes
    ├── Home.js
    ├── Menu.js
    ├── Cart.js
    ├── Checkout.js
    ├── Login.js
    ├── Register.js
    ├── Profile.js
    ├── UserDashboard.js
    ├── AdminDashboard.js
    └── Testimonials.js
```

### Context Providers
```
AuthContext.js
├── State: user, token
├── Functions: login, register, logout
└── Usage: Authentication across app

CartContext.js
├── State: cartItems
├── Functions: addToCart, removeFromCart, updateQuantity, clearCart
└── Usage: Shopping cart management
```

### Component Descriptions

#### Home.js
- **Purpose**: Landing page with hero section and features
- **Features**: Animated hero, feature cards, kitchen story section
- **Dependencies**: React Router, Framer Motion

#### Menu.js
- **Purpose**: Display and filter menu items
- **Features**: Category filtering, add to cart, image handling
- **State**: menu, loading, error, selectedCategory
- **API**: GET /api/menu

#### Cart.js
- **Purpose**: Shopping cart management
- **Features**: Quantity adjustment, item removal, order summary
- **State**: cartItems (from context)
- **API**: Uses CartContext

#### Checkout.js
- **Purpose**: Order placement and confirmation
- **Features**: Order review, place order API call
- **API**: POST /api/orders

#### Login.js & Register.js
- **Purpose**: User authentication
- **Features**: Form validation, premium UI with animations
- **API**: POST /api/auth/login, POST /api/auth/register

#### Profile.js
- **Purpose**: User profile management
- **Features**: View/edit profile, password change
- **API**: GET /api/auth/profile, PUT /api/auth/profile

#### UserDashboard.js
- **Purpose**: User order history and stats
- **Features**: Order tracking, profile management, performance cards
- **API**: GET /api/orders, GET /api/auth/profile

#### AdminDashboard.js
- **Purpose**: Admin management interface
- **Features**: Menu management, order tracking, review moderation
- **API**: Multiple admin endpoints

#### Testimonials.js
- **Purpose**: Customer reviews display and submission
- **Features**: Star ratings, review form, admin moderation
- **API**: GET /api/testimonials, POST /api/testimonials

---

##  Function Call Flow

### User Registration Flow
```
1. User fills registration form (Register.js)
2. Form validation (express-validator)
3. POST /api/auth/register
4. authController.registerUser()
5. Check if phone exists in database
6. Hash password with bcrypt
7. Insert user into users table
8. Return success response
9. Redirect to login page
```

### User Login Flow
```
1. User enters credentials (Login.js)
2. POST /api/auth/login
3. authController.loginUser()
4. Find user by phone in database
5. Compare password with bcrypt
6. Generate JWT token
7. Return token and user data
8. Store token in localStorage
9. Update AuthContext state
10. Redirect to dashboard
```

### Menu Browsing Flow
```
1. User navigates to /menu (Menu.js)
2. GET /api/menu
3. menuController.getMenu()
4. Query menu table with category joins
5. Filter by is_available = 1
6. Return menu items with images
7. Display in grid layout
8. User can filter by category
9. User can add items to cart
```

### Order Placement Flow
```
1. User adds items to cart (CartContext)
2. User proceeds to checkout (Checkout.js)
3. POST /api/orders with token
4. orderController.placeOrder()
5. Validate order total and items
6. Insert order into orders table
7. Set status to "Pending"
8. Clear cart (CartContext)
9. Display confirmation
```

### Admin Order Management Flow
```
1. Admin logs in (AdminDashboard.js)
2. Polls GET /api/orders/admin
3. orderController.fetchAllOrders()
4. Display orders in table
5. Admin changes status via dropdown
6. PUT /api/orders/:id/status
7. orderController.updateOrderStatus()
8. Update status in database
9. Refresh order list
```

### Menu Management Flow (Admin)
```
1. Admin navigates to menu section
2. GET /api/menu/admin
3. menuController.getAdminMenu()
4. Display all menu items
5. Admin adds new item:
   - POST /api/menu with image
   - menuController.addMenuItem()
   - Upload image via Multer
   - Insert into menu table
6. Admin edits item:
   - PUT /api/menu/:id
   - menuController.updateMenuItem()
7. Admin toggles visibility:
   - PATCH /api/menu/:id/availability
   - menuController.toggleMenuAvailability()
```

---

## Design and Approach

### Design Philosophy
- **User-Centric**: Intuitive interface with premium aesthetics
- **Performance-First**: Optimized loading and smooth animations
- **Security-Conscious**: JWT authentication, input validation, password hashing
- **Scalable Architecture**: Modular design supporting future enhancements
- **Mobile-Responsive**: Adaptive layouts for all screen sizes

### Frontend Design Approach
1. **Component-Based Architecture**: Reusable React components
2. **State Management**: Context API for global state (auth, cart)
3. **Routing**: React Router for SPA navigation
4. **Styling**: CSS with custom properties for theming
5. **Animations**: Framer Motion for smooth transitions
6. **API Integration**: Axios for HTTP requests with error handling

### Backend Design Approach
1. **RESTful API**: Standard HTTP methods and status codes
2. **Middleware Layer**: Authentication, authorization, validation
3. **Controller Pattern**: Separation of business logic
4. **Database Abstraction**: MySQL with mysql2 driver
5. **Security**: JWT tokens, bcrypt hashing, rate limiting
6. **File Handling**: Multer for image uploads

### Database Design Approach
1. **Normalization**: Proper table relationships
2. **Indexing**: Optimized query performance
3. **Data Integrity**: Foreign key constraints
4. **Scalability**: Support for future features
5. **Security**: Password hashing, sensitive data protection

---

## 🔒 Security Implementation

### Authentication & Authorization
- **JWT Tokens**: 1-hour expiration for user sessions
- **Password Hashing**: bcrypt with salt rounds (10)
- **Role-Based Access**: Admin vs user permissions
- **Token Verification**: Middleware for protected routes

### Input Validation
- **Server-Side**: express-validator for API inputs
- **Client-Side**: Form validation in React components
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization

### Security Headers
- **Helmet**: Security HTTP headers
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: Prevent brute force attacks
- **File Upload Validation**: Type and size restrictions

### Environment Variables
- **Sensitive Data**: Database credentials, JWT secret
- **Configuration**: Port numbers, API URLs
- **No Hardcoded Secrets**: All secrets in .env file

---

## 🚀 Deployment Guide

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn package manager

### Backend Deployment
1. **Environment Setup**:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure database credentials in .env
   ```

2. **Database Setup**:
   ```sql
   CREATE DATABASE cloudkitchen;
   -- Import schema or run migrations
   ```

3. **Start Server**:
   ```bash
   npm start
   # Server runs on port 5002
   ```

### Frontend Deployment
1. **Environment Setup**:
   ```bash
   cd frontend
   npm install
   ```

2. **Configuration**:
   ```javascript
   // Set API base URL in .env
   REACT_APP_API_BASE_URL=http://localhost:5002
   ```

3. **Development**:
   ```bash
   npm start
   # Runs on http://localhost:3000
   ```

4. **Production Build**:
   ```bash
   npm run build
   # Deploy build/ directory to web server
   ```

### Production Considerations
- **Environment Variables**: Use production database credentials
- **HTTPS**: Enable SSL for secure connections
- **Domain**: Configure CORS for production domain
- **Database Backups**: Regular MySQL backups
- **Monitoring**: Application performance monitoring
- **Scaling**: Load balancer for multiple instances

---

##  Future Enhancements

### Planned Features
1. **Real-time Notifications**: WebSocket for order alerts
2. **Table Management**: QR code-based table ordering
3. **Payment Integration**: Stripe/PayPal payment gateway
4. **Advanced Analytics**: Sales reports and customer insights
5. **Email Notifications**: Order confirmations and updates
6. **Mobile App**: React Native mobile application
7. **Inventory Management**: Stock tracking and alerts
8. **Delivery Tracking**: Real-time delivery status

### Scalability Improvements
1. **Database Optimization**: Query optimization and caching
2. **CDN Integration**: Static asset delivery
3. **Microservices Architecture**: Separate services for scaling
4. **Load Balancing**: Multiple server instances
5. **Containerization**: Docker for deployment

---

##  Troubleshooting

### Common Issues

#### Database Connection Error
- **Solution**: Check MySQL service status, verify .env credentials
- **Command**: `netstat -an | findstr 3306` (Windows)

#### Port Already in Use
- **Solution**: Change PORT in .env or kill process using port
- **Command**: `taskkill /PID <pid> /F` (Windows)

#### CORS Errors
- **Solution**: Configure CORS in backend to allow frontend origin
- **Config**: Update allowedOrigins in server.js

#### Build Failures
- **Solution**: Clear node_modules and reinstall
- **Command**: `rm -rf node_modules && npm install`

---

##  Support and Maintenance

### Monitoring
- **Application Logs**: Console output and error tracking
- **Database Logs**: MySQL slow query log
- **Performance Metrics**: Response time monitoring

### Backup Strategy
- **Database**: Daily MySQL dumps
- **Code**: Git version control
- **Assets**: Image backup from uploads directory

### Maintenance Tasks
- **Weekly**: Security updates, dependency patches
- **Monthly**: Database optimization, log cleanup
- **Quarterly**: Feature reviews, architecture assessment

---

##  Development Guidelines

### Code Standards
- **JavaScript**: ES6+ syntax, camelCase naming
- **React**: Functional components, hooks for state
- **CSS**: Custom properties for theming, BEM methodology
- **API**: RESTful conventions, proper HTTP status codes

### Git Workflow
- **Branch Strategy**: feature branches, main for production
- **Commit Messages**: Conventional commits format
- **Code Review**: Peer review before merging

### Testing Strategy
- **Unit Tests**: Component and function testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: User flow testing
- **Manual Testing**: Cross-browser compatibility

---

##  Learning Resources

### Documentation
- **React**: https://react.dev
- **Node.js**: https://nodejs.org/docs
- **Express**: https://expressjs.com
- **MySQL**: https://dev.mysql.com/doc

### Best Practices
- **Security**: OWASP guidelines
- **Performance**: Web.dev optimization
- **Accessibility**: WCAG 2.1 standards

---

## 📄 License and Credits

### License
- **Project**: Proprietary (Contact for licensing)
- **Dependencies**: Refer to individual package licenses

### Credits
- **Development**: Cloud Kitchen Team
- **Design**: Premium UI/UX implementation
- **Images**: Unsplash (food photography)

---

**Document Version**: 1.0  
**Last Updated**: 2026-08-10  
**Maintained By**: Development Team