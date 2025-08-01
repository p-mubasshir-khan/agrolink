# 🌾 Agrolink - Direct-to-Customer Agri-Marketplace

## 📋 Project Overview

**Agrolink** is a comprehensive e-commerce platform designed to bridge the gap between farmers and customers, enabling direct sales of fresh agricultural products. The platform eliminates middlemen, ensuring better prices for farmers and fresh produce for customers.

### 🎯 Key Features

#### **For Customers:**
- **Browse Products**: View fresh produce from local farmers
- **Advanced Search & Filtering**: Search by name, filter by category and city
- **Product Details**: Detailed product information with farmer details
- **User Authentication**: Secure registration and login system
- **Responsive Design**: Mobile-friendly interface

#### **For Farmers:**
- **Product Management**: Add, edit, and manage product listings
- **Profile Management**: Update farm information and personal details
- **Approval System**: Admin approval for farmer accounts

#### **For Administrators:**
- **User Management**: Approve/reject farmer registrations
- **Platform Oversight**: Monitor all activities and users
- **Content Management**: Manage products and categories

## 🛠️ Technology Stack

### **Frontend (React)**
- **React 18** - Modern UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Context API** - State management

### **Backend (Node.js)**
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **Express Validator** - Input validation

### **Development Tools**
- **Nodemon** - Auto-restart server during development
- **Concurrently** - Run frontend and backend simultaneously

## 📁 Project Structure

```
agrolink/
├── src/                          # React Frontend
│   ├── components/               # Reusable UI components
│   │   ├── Header.js
│   │   ├── Footer.js
│   │   ├── ProductCard.js
│   │   └── LoadingSpinner.js
│   ├── pages/                    # Page components
│   │   ├── Home.js
│   │   ├── Products.js
│   │   ├── ProductDetail.js
│   │   ├── Login.js
│   │   ├── Register.js
│   │   ├── Profile.js
│   │   └── Admin.js
│   ├── context/                  # React Context
│   │   └── AuthContext.js
│   ├── utils/                    # Utility functions
│   │   └── api.js
│   ├── App.js                    # Main App component
│   ├── index.js                  # Entry point
│   └── index.css                 # Global styles
├── backend/                      # Node.js Backend
│   ├── models/                   # Database models
│   │   ├── User.js
│   │   └── Product.js
│   ├── routes/                   # API routes
│   │   ├── auth.js
│   │   ├── products.js
│   │   └── users.js
│   ├── middleware/               # Custom middleware
│   │   ├── auth.js
│   │   └── upload.js
│   ├── uploads/                  # File uploads directory
│   ├── server.js                 # Main server file
│   ├── createAdmin.js            # Admin creation script
│   └── createSampleProducts.js   # Sample data script
├── public/                       # Static files
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── package.json                  # Root package.json
├── tailwind.config.js           # Tailwind configuration
├── postcss.config.js            # PostCSS configuration
└── README.md                    # This file
```

## 🚀 Installation & Setup

### **Prerequisites**
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Git

### **Step 1: Clone the Repository**
```bash
git clone <repository-url>
cd agrolink
```

### **Step 2: Install Dependencies**
```bash
# Install all dependencies (frontend + backend)
npm run install-all
```

### **Step 3: Environment Setup**
Create `.env` file in the backend directory:
```env
MONGODB_URI=mongodb://localhost:27017/agrolink
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
```

### **Step 4: Database Setup**
```bash
# Start MongoDB (if using local)
mongod

# Create admin user
cd backend
node createAdmin.js

# Create sample products
node createSampleProducts.js
```

### **Step 5: Start the Application**
```bash
# Development mode (both frontend and backend)
npm run dev

# Or run separately:
# Backend only
npm run server:dev

# Frontend only
npm start
```

## 📱 Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start React development server |
| `npm run build` | Build React app for production |
| `npm run server` | Start backend server |
| `npm run server:dev` | Start backend with nodemon |
| `npm run dev` | Run both frontend and backend |
| `npm run install-all` | Install all dependencies |

## 🔐 Authentication System

### **User Roles**
1. **Customer** - Can browse and purchase products
2. **Farmer** - Can list and manage products
3. **Admin** - Can manage users and platform

### **Registration Process**
- Customers: Auto-approved
- Farmers: Require admin approval
- Admins: Auto-approved

### **Default Admin Account**
- **Email**: admin@agrolink.com
- **Password**: admin123456
- **Role**: admin

## 🛍️ Product Management

### **Product Categories**
- Vegetables
- Fruits
- Grains
- Dairy
- Poultry
- Other

### **Product Fields**
- Name, Description, Price
- Quantity, Unit (kg, piece, dozen)
- Category, City
- Farmer information
- Product images

## 🌐 API Endpoints

### **Authentication**
```
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
GET  /api/auth/profile     # Get user profile
PUT  /api/auth/profile     # Update user profile
```

### **Products**
```
GET    /api/products       # Get all products (with filters)
GET    /api/products/:id   # Get single product
POST   /api/products       # Create new product (farmer only)
PUT    /api/products/:id   # Update product (owner only)
DELETE /api/products/:id   # Delete product (owner only)
```

### **Users**
```
GET    /api/users          # Get all users (admin only)
PUT    /api/users/:id      # Update user (admin only)
DELETE /api/users/:id      # Delete user (admin only)
```

## 🎨 UI/UX Features

### **Design System**
- **Color Scheme**: Green-based primary colors
- **Typography**: Clean, readable fonts
- **Icons**: Lucide React icons
- **Responsive**: Mobile-first design

### **Components**
- **Header**: Navigation and user menu
- **Product Cards**: Product display with actions
- **Forms**: Login, registration, product forms
- **Loading States**: Spinners and skeletons
- **Error Handling**: User-friendly error messages

## 🔧 Configuration Files

### **Tailwind CSS Configuration**
```javascript
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          // ... green color palette
        }
      }
    },
  },
  plugins: [],
}
```

### **PostCSS Configuration**
```javascript
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

## 🗄️ Database Schema

### **User Model**
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (customer/farmer/admin),
  city: String,
  isApproved: Boolean,
  farmDescription: String (farmer only)
}
```

### **Product Model**
```javascript
{
  name: String,
  description: String,
  price: Number,
  quantity: Number,
  unit: String (kg/piece/dozen),
  category: String,
  image: String,
  city: String,
  farmer: ObjectId (ref: User),
  isAvailable: Boolean
}
```

## 🚨 Error Handling

### **Frontend Error Handling**
- API call failures
- Network connectivity issues
- Form validation errors
- Authentication errors

### **Backend Error Handling**
- Database connection errors
- Validation errors
- Authentication middleware
- File upload errors

## 🔒 Security Features

### **Authentication & Authorization**
- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- Protected routes

### **Input Validation**
- Express-validator for API validation
- Frontend form validation
- File upload restrictions

## 📊 Sample Data

### **Sample Products**
- Fresh Milk (Dairy)
- Organic Tomatoes (Vegetables)
- Sweet Corn (Vegetables)
- Fresh Eggs (Poultry)
- Basmati Rice (Grains)

### **Sample Users**
- Admin: admin@agrolink.com
- Farmer: farmer@agrolink.com
- Customer: customer@agrolink.com

## 🧪 Testing

### **Manual Testing Checklist**
- [ ] User registration and login
- [ ] Product browsing and filtering
- [ ] Product detail viewing
- [ ] Admin user management
- [ ] Farmer product management
- [ ] Responsive design on mobile

## 🚀 Deployment

### **Frontend Deployment**
```bash
npm run build
# Deploy build folder to hosting service
```

### **Backend Deployment**
```bash
# Set production environment variables
# Deploy to cloud platform (Heroku, AWS, etc.)
```

## 📈 Future Enhancements

### **Planned Features**
- Shopping cart functionality
- Payment gateway integration
- Real-time chat between farmers and customers
- Order tracking system
- Review and rating system
- Push notifications
- Advanced analytics dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

**Agrolink Development Team**
- Frontend Development
- Backend Development
- UI/UX Design
- Database Design

## 📞 Support

For support and questions:
- Email: khan.srmap@gmail.com

---

**Built with ❤️ for the agricultural community**
