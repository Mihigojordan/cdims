# CDIMS Backend API

## Diocese Infrastructure Management System - Backend

This is the backend API for the Diocese Infrastructure Management System (CDIMS), built with Node.js, Express.js, and MySQL.

## Features

- **User Management**: Role-based authentication and authorization
- **Request Management**: Complete workflow from creation to approval
- **Material Management**: Catalog of materials with pricing
- **Inventory Management**: Stock tracking and movements
- **Procurement**: Purchase orders and goods receipts
- **Reporting**: Comprehensive reports and analytics
- **File Upload**: Support for attachments and documents

## Technology Stack

- **Runtime**: Node.js v16+
- **Framework**: Express.js
- **Database**: MySQL 8.0+
- **ORM**: Sequelize
- **Authentication**: JWT tokens
- **Validation**: Joi
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate limiting

## Quick Start

### Prerequisites

- Node.js v16 or higher
- MySQL 8.0 or higher
- npm or yarn

### Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp env.example .env
   # Edit .env with your database credentials
   ```

4. **Create MySQL database**
   ```sql
   CREATE DATABASE cdims CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

5. **Run database migrations**
   ```bash
   npm run migrate
   ```

6. **Seed initial data**
   ```bash
   npm run seed
   ```

7. **Start development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=cdims
DB_USER=root
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3000
NODE_ENV=development

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Users
- `GET /api/users` - List users (Admin only)
- `POST /api/users` - Create user (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)
- `GET /api/users/roles` - Get all roles

### Requests
- `GET /api/requests` - List requests
- `POST /api/requests` - Create request (Site Engineer)
- `GET /api/requests/:id` - Get request details
- `PUT /api/requests/:id` - Update request
- `POST /api/requests/:id/submit` - Submit request
- `POST /api/requests/:id/approve` - Approve request
- `POST /api/requests/:id/reject` - Reject request

### Materials
- `GET /api/materials` - List materials
- `POST /api/materials` - Create material
- `GET /api/materials/:id` - Get material details
- `PUT /api/materials/:id` - Update material
- `DELETE /api/materials/:id` - Delete material
- `GET /api/materials/categories` - Get categories
- `GET /api/materials/units` - Get units

### Stock
- `GET /api/stock` - List stock levels
- `GET /api/stock/movements` - List stock movements
- `POST /api/stock/adjust` - Adjust stock (Storekeeper)
- `GET /api/stock/low-stock` - Get low stock items

### Procurement
- `GET /api/procurement/suppliers` - List suppliers
- `POST /api/procurement/suppliers` - Create supplier
- `GET /api/procurement/purchase-orders` - List purchase orders
- `POST /api/procurement/purchase-orders` - Create purchase order
- `GET /api/procurement/goods-receipts` - List goods receipts
- `POST /api/procurement/goods-receipts` - Create goods receipt

### Reports
- `GET /api/reports/requests` - Request reports
- `GET /api/reports/inventory` - Inventory reports
- `GET /api/reports/budget` - Budget reports
- `GET /api/reports/stock-movements` - Stock movement reports
- `GET /api/reports/procurement` - Procurement reports

## User Roles

1. **ADMIN** - System administration
2. **SITE_ENGINEER** - Create and manage requests
3. **DIOCESAN_SITE_ENGINEER** - Review and modify requests
4. **PADIRI** - Final approval authority
5. **STOREKEEPER** - Manage inventory and issue materials
6. **PROCUREMENT** - Handle purchase orders and suppliers

## Default Credentials

After running the seed command, you can login with:

- **Email**: admin@cdims.rw
- **Password**: admin123

## Database Schema

The system uses a comprehensive MySQL database with the following main entities:

- **Users & Roles**: Authentication and authorization
- **Sites & Budget Lines**: Project and financial tracking
- **Materials & Categories**: Inventory catalog
- **Requests & Items**: Material request management
- **Approvals**: Workflow tracking
- **Stock Management**: Inventory tracking
- **Procurement**: Purchase order management
- **Issuance**: Material distribution

## Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run migrate` - Run database migrations
- `npm run migrate:undo` - Undo last migration
- `npm run seed` - Seed initial data
- `npm run seed:undo` - Undo all seeds
- `npm test` - Run tests

### Project Structure

```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Custom middleware
│   ├── routes/         # API routes
│   ├── config/         # Configuration files
│   ├── utils/          # Utility functions
│   └── validators/     # Input validation
├── models/             # Sequelize models
├── migrations/         # Database migrations
├── seeders/           # Database seeders
├── config/            # Sequelize configuration
└── uploads/           # File upload directory
```

## Security Features

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- Rate limiting
- CORS protection
- Helmet security headers
- SQL injection prevention
- File upload security

## Error Handling

The API uses a centralized error handling middleware that:

- Logs errors for debugging
- Returns consistent error responses
- Handles different error types appropriately
- Provides helpful error messages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

## License

This project is proprietary software for the Catholic Diocese of Cyangugu.

## Support

For support and questions, please contact the development team.
