# Serve Smart - Real-Time Table Order & Billing System

## 📋 Overview

Serve Smart is a comprehensive real-time table order and billing system designed for restaurants and cafes. It features a backend API built with Node.js/Express and a responsive frontend for seamless order management.

## 🏗️ Project Structure

```
Serve-Smart/
├── backend/
│   ├── config/
│   │   └── db.js              # Database configuration
│   ├── controllers/
│   │   ├── menuController.js  # Menu CRUD logic
│   │   └── orderController.js # Order CRUD logic
│   ├── routes/
│   │   ├── menuRoutes.js      # Menu API endpoints
│   │   └── orderRoutes.js     # Order API endpoints
│   ├── server.js              # Main Express server
│   ├── package.json           # Dependencies
│   ├── .env                   # Environment variables
│   └── db.sql                 # Database schema
└── frontend/
    └── (Frontend files)
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- MySQL (v5.7 or higher)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/lochana-12/Serve-Smart.git
   cd Serve-Smart/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env` file or create it with the following:
   ```env
   NODE_ENV=development
   PORT=3000
   
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=servesmart
   DB_PORT=3306
   
   API_BASE_URL=http://localhost:3000
   CORS_ORIGIN=*
   LOG_LEVEL=debug
   ```

4. **Setup database**
   - Import the SQL schema:
   ```bash
   mysql -u root -p < db.sql
   ```
   - Or run manually in MySQL:
   ```sql
   SOURCE db.sql;
   ```

5. **Start the server**
   - Production:
     ```bash
     npm start
     ```
   - Development (with auto-reload):
     ```bash
     npm run dev
     ```

   The server will start at `http://localhost:3000`

## 📡 API Endpoints

### Menu Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/menu` | Get all menu items |
| GET | `/api/menu/:id` | Get menu item by ID |
| GET | `/api/menu/category/:category` | Get items by category |
| POST | `/api/menu` | Create new menu item |
| PUT | `/api/menu/:id` | Update menu item |
| DELETE | `/api/menu/:id` | Delete menu item |

### Order Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | Get all orders |
| GET | `/api/orders/:id` | Get order by ID |
| GET | `/api/orders/table/:tableNumber` | Get orders for table |
| GET | `/api/orders/status/pending` | Get pending orders |
| POST | `/api/orders` | Create new order |
| PUT | `/api/orders/:id` | Update order status |
| DELETE | `/api/orders/:id` | Delete order |

### Health & Status

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API welcome message |
| GET | `/health` | Server health check |

## 📝 Example API Requests

### Create a Menu Item
```bash
curl -X POST http://localhost:3000/api/menu \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Grilled Chicken",
    "category": "Main Course",
    "price": 399.99,
    "description": "Succulent grilled chicken breast"
  }'
```

### Create an Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "table_number": 5,
    "items": [
      {
        "menu_id": 1,
        "quantity": 2,
        "price": 299.00
      },
      {
        "menu_id": 7,
        "quantity": 1,
        "price": 49.00
      }
    ]
  }'
```

### Update Order Status
```bash
curl -X PUT http://localhost:3000/api/orders/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "ready"
  }'
```

## 🗄️ Database Schema

### Menu Table
- `id` - Primary key
- `name` - Dish name
- `category` - Food category (Pizza, Burger, etc.)
- `price` - Decimal price
- `description` - Item description
- `is_available` - Availability status
- `created_at`, `updated_at` - Timestamps

### Orders Table
- `id` - Primary key
- `table_number` - Table identifier
- `total_amount` - Order total
- `status` - Order status (pending, confirmed, preparing, ready, served, completed, cancelled)
- `notes` - Special instructions
- `created_at`, `updated_at` - Timestamps

### Order Items Table
- `id` - Primary key
- `order_id` - Foreign key to orders
- `menu_id` - Foreign key to menu
- `quantity` - Item quantity
- `price` - Item price at time of order
- `special_requests` - Item-specific notes

## 🔧 Technologies Used

- **Backend Framework**: Express.js
- **Database**: MySQL
- **Runtime**: Node.js
- **Package Manager**: npm
- **Environment Management**: dotenv
- **API Middleware**: CORS, Body Parser

## 📦 Dependencies

- `express` (^4.18.2) - Web framework
- `cors` (^2.8.5) - Cross-origin resource sharing
- `body-parser` (^1.20.2) - Request body parsing
- `mysql2` (^3.6.5) - MySQL driver
- `dotenv` (^16.3.1) - Environment variable management

### Development Dependencies
- `nodemon` (^3.0.1) - Development auto-reload

## 🛠️ Development

### File Structure Explanation

```
backend/
├── config/
│   └── db.js              # Database connection and queries
├── controllers/
│   ├── menuController.js  # Business logic for menu operations
│   └── orderController.js # Business logic for order operations
├── routes/
│   ├── menuRoutes.js      # Route definitions for /api/menu
│   └── orderRoutes.js     # Route definitions for /api/orders
├── server.js              # Express app setup and middleware
├── package.json           # Project metadata and dependencies
├── .env                   # Environment configuration (not versioned)
└── db.sql                 # Database initialization script
```

## 📊 Order Status Workflow

```
pending → confirmed → preparing → ready → served → completed
   ↓
   └─────────────────→ cancelled
```

## 🔐 Security Notes

- Environment variables are not committed to the repository
- Database passwords should be stored in `.env`
- CORS is configured to allow all origins (change in production)
- Input validation is performed on all endpoints
- SQL injection is prevented using parameterized queries

## 🐛 Troubleshooting

### Database Connection Issues
- Verify MySQL is running: `mysql -u root -p`
- Check `.env` database credentials
- Ensure database `servesmart` exists: `CREATE DATABASE servesmart;`

### Port Already in Use
- Change `PORT` in `.env`
- Or kill existing process: `lsof -i :3000`

### Module Not Found
- Run `npm install` again
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Lochana**

## 📞 Support

For issues or questions, please create an issue in the GitHub repository.

---

**Happy Serving! 🍽️**
