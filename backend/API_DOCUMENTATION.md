# CDIMS API Documentation

## Overview
This document provides comprehensive documentation for all new and modified endpoints in the CDIMS (Construction and Development Inventory Management System) API.

## Table of Contents
1. [Authentication](#authentication)
2. [Complete Workflow: PENDING → RECEIVED](#complete-workflow-pending--received)
3. [ADMIN & PADIRI - Complete System Access](#admin--padiri---complete-system-access)
4. [Request Management](#request-management)
5. [Stock Management](#stock-management)
6. [Materials Management](#materials-management)
7. [Sites Management](#sites-management)
8. [Stores Management](#stores-management)
9. [Users Management](#users-management)
10. [Site Assignments](#site-assignments)
11. [Request Management (Additional Endpoints)](#request-management-additional-endpoints)
12. [Authentication (Additional Endpoints)](#authentication-additional-endpoints)
13. [Admin Functions](#admin-functions)
14. [Enhanced Workflow Features](#enhanced-workflow-features)
15. [Usage Examples](#usage-examples)
16. [Testing Credentials](#testing-credentials)

---

## Authentication

### Login
**POST** `/api/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "admin@cdims.rw",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "full_name": "System Administrator",
      "email": "admin@cdims.rw",
      "role": {
        "name": "ADMIN"
      },
      "first_login": false
    }
  }
}
```

### Change Password
**PUT** `/api/auth/change-password`

Change user password (required on first login).

**Request Body:**
```json
{
  "current_password": "oldpassword",
  "new_password": "newpassword123"
}
```

---

## Complete Workflow: PENDING → RECEIVED

This section shows the complete workflow from creating a request to receiving materials, with all the necessary API endpoints organized in logical order.

### Workflow Overview
```
PENDING → VERIFIED → APPROVED → PARTIALLY_ISSUED → ISSUED → RECEIVED → CLOSED
```

### Workflow Diagram
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   SITE      │    │     DSE     │    │   PADIRI    │    │ STOREKEEPER │
│  ENGINEER   │    │             │    │             │    │             │
└─────┬───────┘    └─────┬───────┘    └─────┬───────┘    └─────┬───────┘
      │                  │                  │                  │
      │ 1. Create        │ 2. Verify &      │ 3. Final         │ 4. Issue
      │    Request       │    Modify        │    Approval      │    Materials
      │                  │                  │                  │
      ▼                  ▼                  ▼                  ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   PENDING   │───▶│  VERIFIED   │───▶│  APPROVED   │───▶│PARTIALLY_   │
│             │    │             │    │             │    │  ISSUED     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────┬───────┘
                                                               │
                                                               │ 5. Issue
                                                               │    All Items
                                                               ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   SITE      │    │             │    │             │    │             │
│  ENGINEER   │    │             │    │             │    │             │
└─────┬───────┘    └─────────────┘    └─────────────┘    └─────────────┘
      │
      │ 6. Receive
      │    Materials
      │
      ▼
┌─────────────┐    ┌─────────────┐
│  RECEIVED   │───▶│   CLOSED    │
│             │    │             │
└─────────────┘    └─────────────┘
```

### Step 1: Create Request (Site Engineer)
**POST** `/api/requests`

Create a new material request.

**Request Body:**
```json
{
  "site_id": 1,
  "notes": "Construction materials for foundation work",
  "items": [
    {
      "material_id": 1,
      "qty_requested": 20,
      "notes": "Portland cement for foundation"
    },
    {
      "material_id": 2,
      "qty_requested": 50,
      "notes": "Steel reinforcement bars"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "request": {
      "id": 1,
      "ref_no": "REQ-2025-0001",
      "status": "PENDING",
      "site": {
        "name": "Cathedral Construction"
      },
      "items": [
        {
          "id": 1,
          "material": {
            "name": "Portland Cement 50kg",
            "code": "CEM-001"
          },
          "unit": {
            "name": "Bags",
            "code": "bag"
          },
          "qty_requested": 20,
          "qty_approved": null,
          "qty_issued": 0,
          "qty_received": 0
        }
      ]
    }
  }
}
```

### Step 2: DSE Review and Verification
**POST** `/api/requests/{id}/approve`

Diocesan Site Engineer reviews and verifies the request with optional item modifications.

**Request Body:**
```json
{
  "level": "DSE",
  "comment": "Verified with quantity adjustments",
  "item_modifications": [
    {
      "request_item_id": 1,
      "qty_approved": 15,
      "notes": "Reduced quantity based on site assessment"
    }
  ],
  "items_to_add": [
    {
      "material_id": 3,
      "qty_requested": 10,
      "qty_approved": 10,
      "notes": "Additional nails for construction"
    }
  ],
  "modification_reason": "Site assessment showed different requirements"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Request verified successfully",
  "data": {
    "request": {
      "id": 1,
      "status": "VERIFIED",
      "items": [
        {
          "id": 1,
          "qty_requested": 20,
          "qty_approved": 15,
          "notes": "Reduced quantity based on site assessment"
        },
        {
          "id": 3,
          "material": {
            "name": "Nails",
            "code": "NAI-001"
          },
          "qty_requested": 10,
          "qty_approved": 10
        }
      ]
    }
  }
}
```

### Step 3: PADIRI Final Approval
**POST** `/api/requests/{id}/approve`

Padiri gives final approval to the verified request. PADIRI can optionally modify items, quantities, and notes during approval.

**Request Body:**
```json
{
  "level": "PADIRI",
  "comment": "Final approval granted",
  "item_modifications": [
    {
      "request_item_id": 1,
      "qty_approved": 15,
      "material_id": 2,
      "unit_id": 7,
      "notes": "Updated quantity based on site requirements"
    }
  ],
  "items_to_add": [
    {
      "material_id": 3,
      "unit_id": 5,
      "qty_requested": 10,
      "qty_approved": 10,
      "notes": "Additional material needed"
    }
  ],
  "items_to_remove": [4, 5],
  "modification_reason": "Updated quantities and added missing materials"
}
```

**Optional Parameters:**
- `item_modifications` - Modify existing items (quantities, materials, units, notes)
- `items_to_add` - Add new items to the request
- `items_to_remove` - Remove items from the request
- `modification_reason` - Reason for modifications

**Note:** ADMIN users have the same approval and modification capabilities as PADIRI and DSE.

**Response:**
```json
{
  "success": true,
  "message": "Request approved successfully",
  "data": {
    "request": {
      "id": 1,
      "status": "APPROVED",
      "items": [
        {
          "id": 1,
          "qty_requested": 20,
          "qty_approved": 15
        }
      ]
    }
  }
}
```

### Step 4: Storekeeper Issues Materials
**POST** `/api/stock/issue-materials`

Storekeeper issues materials (supports partial issues).

**Request Body:**
```json
{
  "request_id": 1,
  "items": [
    {
      "request_item_id": 1,
      "qty_issued": 10,
      "store_id": 1,
      "notes": "Partial issue for urgent work"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Materials issued successfully",
  "data": {
    "request_id": 1,
    "issued_items": [
      {
        "request_item_id": 1,
        "material_name": "Portland Cement 50kg",
        "qty_issued": 10,
        "store_id": 1
      }
    ],
    "stock_movements": [
      {
        "id": 1,
        "material_id": 1,
        "store_id": 1,
        "movement_type": "OUT",
        "qty_change": -10,
        "qty_after": 90
      }
    ],
    "request_status": "PARTIALLY_ISSUED"
  }
}
```

### Step 5: Site Engineer Receives Materials
**POST** `/api/requests/{id}/receive`

Site Engineer confirms receipt of materials.

**Request Body:**
```json
{
  "items": [
    {
      "request_item_id": 1,
      "qty_received": 10,
      "notes": "Received all materials at site"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Materials received successfully",
  "data": {
    "request_id": "1",
    "received_items": [
      {
        "request_item_id": 1,
        "material_name": "Portland Cement 50kg",
        "qty_received": 10,
        "total_received": 10
      }
    ],
    "request_status": "RECEIVED"
  }
}
```

### Step 6: Complete Workflow Status Transitions

**Status Flow:**
1. **PENDING** - Request created by Site Engineer
2. **VERIFIED** - DSE reviews and verifies with modifications
3. **APPROVED** - PADIRI gives final approval
4. **PARTIALLY_ISSUED** - Storekeeper issues some materials
5. **ISSUED** - Storekeeper issues all approved materials
6. **RECEIVED** - Site Engineer confirms receipt
7. **CLOSED** - Request automatically closed when fully received

### Supporting Endpoints for Workflow

**Get Issuable Requests (Storekeeper):**
**GET** `/api/stock/issuable-requests`
- Shows all requests ready for material issuance
- Filtered by site and status

**Get Request Details:**
**GET** `/api/requests/{id}`
- View complete request details at any stage
- Includes all items, approvals, and status history

**Get Stock History:**
**GET** `/api/stock/history`
- Track all stock movements during issuance
- Filter by material, store, date range

**Get My Requests (Site Engineer):**
**GET** `/api/requests/my-requests`
- View all requests created by current user
- Filter by status, date, site

**Get Site Engineer Requests:**
**GET** `/api/requests/site-engineer`
- Enhanced view for site engineers
- Shows detailed item information and quantities

### Workflow Permissions

**🔑 ADMIN & PADIRI - FULL SYSTEM ACCESS:**
- ✅ **ALL Site Engineer permissions** + more
- ✅ **ALL Diocesan Site Engineer permissions** + more  
- ✅ **ALL Storekeeper permissions** + more
- ✅ **ALL Report permissions** + more
- ✅ **System Administration** (exclusive)
- ✅ **Database Management** (exclusive)
- ✅ **User Management** (exclusive)
- ✅ **Override any restrictions**
- ✅ **Access all data across all sites**
- ✅ **Modify any request at any stage**
- ✅ **Issue materials from any store**
- ✅ **Receive materials for any site**
- ✅ **Create/modify/delete any entity**

**Site Engineer:**
- Create requests
- Receive materials
- View own requests
- Update request details

**Diocesan Site Engineer (DSE):**
- Verify requests
- Modify items during verification
- View all requests
- Add/remove items

**Storekeeper:**
- View issuable requests
- Issue materials (partial or full)
- Manage stock levels
- View stock history

---

## ADMIN & PADIRI - Complete System Access

**ADMIN and PADIRI have FULL ACCESS to ALL system functionalities.** They can perform every action that any other user role can perform, plus exclusive administrative functions.

### Complete Permission Matrix

**✅ REQUEST MANAGEMENT (All Actions):**
- Create requests (like Site Engineer)
- View ALL requests (not just own)
- Modify ANY request at ANY stage
- Approve/reject requests (like DSE/PADIRI)
- **Modify items during approval** (quantities, materials, units, notes)
- **Add/remove items during approval** (optional)
- Receive materials (like Site Engineer)
- Close requests
- Add comments and attachments
- View request history and audit logs

**✅ STOCK MANAGEMENT (All Actions):**
- View ALL stock levels across ALL stores
- Issue materials from ANY store (like Storekeeper)
- Add stock quantities
- View stock history and movements
- Get issuable requests
- Get issued materials history
- Manage low stock alerts
- Create/update/delete stock entries
- Set stock thresholds

**✅ MATERIALS MANAGEMENT (All Actions):**
- View ALL materials
- Create/update/delete materials
- Manage categories and units
- Set material prices
- View material history

**✅ SITES MANAGEMENT (All Actions):**
- View ALL sites
- Create/update/delete sites
- Assign sites to users
- View site performance

**✅ STORES MANAGEMENT (All Actions):**
- View ALL stores
- Create/update/delete stores
- Manage store capacity
- View store performance

**✅ USERS MANAGEMENT (Exclusive to ADMIN/PADIRI):**
- View ALL users
- Create/update/delete users
- Toggle user status
- Assign roles
- View user activity
- Manage user permissions

**✅ SYSTEM ADMINISTRATION (Exclusive to ADMIN/PADIRI):**
- View audit logs
- System statistics
- Database management
- Backup and restore
- System configuration
- Export all data
- Performance monitoring

**✅ REPORTING (All Reports):**
- Request reports
- Inventory reports
- Stock movement reports
- Procurement reports
- User activity reports
- Site performance reports
- Custom reports

### Key Administrative Capabilities

**🔧 Override Restrictions:**
- Bypass role-based limitations
- Access any endpoint regardless of role requirements
- Modify any data at any stage
- Override approval workflows

**📊 Complete Data Access:**
- View all sites and requests
- Access all stores and stock
- Manage all users and permissions
- Monitor all system activities

**⚙️ System Control:**
- Configure system settings
- Manage database operations
- Control user access
- Monitor system performance

**📈 Advanced Operations:**
- Bulk data operations
- System maintenance
- Data export/import
- Audit trail management

### ADMIN/PADIRI Action Examples

**🔧 ADMIN/PADIRI can perform ANY role's actions:**

**As Site Engineer:**
```bash
# Create requests (like Site Engineer)
curl -X POST http://localhost:3000/api/requests \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"site_id": 1, "notes": "Admin creating request", "items": [...]}'

# Receive materials (like Site Engineer)
curl -X POST http://localhost:3000/api/requests/1/receive \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"items": [{"request_item_id": 1, "qty_received": 10}]}'
```

**As Storekeeper:**
```bash
# Issue materials (like Storekeeper)
curl -X POST http://localhost:3000/api/stock/issue-materials \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"request_id": 1, "items": [{"request_item_id": 1, "qty_issued": 10, "store_id": 1}]}'

# Add stock quantities (like Storekeeper)
curl -X POST http://localhost:3000/api/stock/1/add-quantity \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"qty_to_add": 50, "notes": "Admin adding stock"}'
```

**As DSE:**
```bash
# Verify requests (like DSE)
curl -X POST http://localhost:3000/api/requests/1/approve \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"level": "DSE", "comment": "Admin verifying as DSE"}'
```

**Exclusive Admin Functions:**
```bash
# User management (ADMIN/PADIRI only)
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"full_name": "New User", "email": "user@cdims.rw", "role_id": 2}'

# System configuration (ADMIN/PADIRI only)
curl -X PUT http://localhost:3000/api/admin/system-configs/max_requests_per_day \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value": "100", "description": "Updated limit"}'

# Database backup (ADMIN/PADIRI only)
curl -X POST http://localhost:3000/api/admin/database/backup \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"backup_name": "admin_backup_2025"}'
```

---

## Request Management

### Create Request
**POST** `/api/requests`

Create a new material request.

**Request Body:**
```json
{
  "site_id": 1,
  "notes": "Construction materials for foundation work",
  "items": [
    {
      "material_id": 1,
      "qty_requested": 20,
      "notes": "Portland cement for foundation"
    },
    {
      "material_id": 2,
      "qty_requested": 50,
      "notes": "Steel reinforcement bars"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "request": {
      "id": 1,
      "ref_no": "REQ-2025-0001",
      "status": "PENDING",
      "site": {
        "name": "Cathedral Construction"
      },
      "items": [
        {
          "id": 1,
          "material": {
            "name": "Portland Cement 50kg",
            "code": "CEM-001"
          },
          "unit": {
            "name": "Bags",
            "code": "bag"
          },
          "qty_requested": 20,
          "qty_approved": null,
          "qty_issued": 0,
          "qty_received": 0
        }
      ]
    }
  }
}
```

### Enhanced Approval with Item Modifications
**POST** `/api/requests/{id}/approve`

Approve request with optional item modifications (PADIRI and DIOCESAN_SITE_ENGINEER only).

**Request Body:**
```json
{
  "level": "DSE",
  "comment": "Approved with quantity adjustments",
  "item_modifications": [
    {
      "request_item_id": 1,
      "qty_approved": 15,
      "notes": "Reduced quantity based on site assessment"
    }
  ],
  "items_to_add": [
    {
      "material_id": 3,
      "qty_requested": 10,
      "qty_approved": 10,
      "notes": "Additional nails for construction"
    }
  ],
  "items_to_remove": [2],
  "modification_reason": "Site assessment showed different requirements"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Request approved successfully",
  "data": {
    "request": {
      "id": 1,
      "status": "VERIFIED",
      "items": [
        {
          "id": 1,
          "qty_requested": 20,
          "qty_approved": 15,
          "notes": "Reduced quantity based on site assessment"
        },
        {
          "id": 3,
          "material": {
            "name": "Nails",
            "code": "NAI-001"
          },
          "qty_requested": 10,
          "qty_approved": 10
        }
      ]
    }
  }
}
```

### Receive Materials
**POST** `/api/requests/{id}/receive`

Site Engineer confirms receipt of materials.

**Request Body:**
```json
{
  "items": [
    {
      "request_item_id": 1,
      "qty_received": 15,
      "notes": "Received all materials at site"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Materials received successfully",
  "data": {
    "request_id": "1",
    "received_items": [
      {
        "request_item_id": 1,
        "material_name": "Portland Cement 50kg",
        "qty_received": 15,
        "total_received": 15
      }
    ],
    "request_status": "RECEIVED"
  }
}
```

### Get All Requests with Enhanced Filtering
**GET** `/api/requests`

Get all requests with comprehensive filtering options.

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 10)
- `status` (string): Filter by status
- `site_id` (integer): Filter by site
- `date_from` (string): Filter from date (YYYY-MM-DD)
- `date_to` (string): Filter to date (YYYY-MM-DD)
- `material_id` (integer): Filter by material
- `ref_no` (string): Filter by reference number
- `search` (string): Search in notes and reference number

**Example:**
```
GET /api/requests?status=APPROVED&date_from=2025-01-01&date_to=2025-12-31&page=1&limit=20
```

---

## Stock Management

### Enhanced Stock Issuance
**POST** `/api/stock/issue-materials`

Issue materials with automatic remaining quantity updates.

**Request Body:**
```json
{
  "request_id": 1,
  "items": [
    {
      "request_item_id": 1,
      "qty_issued": 10,
      "store_id": 1,
      "notes": "Partial issue for urgent work"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Materials issued successfully",
  "data": {
    "request_id": 1,
    "issued_items": [
      {
        "request_item_id": 1,
        "material_name": "Portland Cement 50kg",
        "qty_issued": 10,
        "store_id": 1
      }
    ],
    "stock_movements": [
      {
        "id": 1,
        "material_id": 1,
        "store_id": 1,
        "movement_type": "OUT",
        "qty_change": -10,
        "qty_after": 90
      }
    ],
    "request_status": "PARTIALLY_ISSUED"
  }
}
```

### Add Stock Quantity
**POST** `/api/stock/{id}/add-quantity`

Add quantity to existing stock (additive updates).

**Request Body:**
```json
{
  "qty_to_add": 25.5,
  "notes": "New stock delivery"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Stock quantity updated successfully",
  "data": {
    "stock_id": 1,
    "previous_qty": "100.000",
    "added_qty": 25.5,
    "new_qty": "125.500"
  }
}
```

### Get Stock History
**GET** `/api/stock/history`

Get stock movement history with filtering.

**Query Parameters:**
- `page` (integer): Page number
- `limit` (integer): Items per page
- `material_id` (integer): Filter by material
- `store_id` (integer): Filter by store
- `movement_type` (string): Filter by movement type (IN/OUT)
- `date_from` (string): Filter from date
- `date_to` (string): Filter to date

**Example:**
```
GET /api/stock/history?material_id=1&date_from=2025-01-01&movement_type=OUT
```

### Get Issuable Requests
**GET** `/api/stock/issuable-requests`

Get requests ready for material issuance (Storekeeper only).

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 10)
- `site_id` (integer): Filter by site

**Response:**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": 1,
        "ref_no": "REQ-2025-0001",
        "status": "APPROVED",
        "site": {
          "name": "Cathedral Construction"
        },
        "items": [
          {
            "id": 1,
            "material": {
              "name": "Portland Cement 50kg",
              "code": "CEM-001"
            },
            "qty_requested": 20,
            "qty_approved": 20,
            "qty_issued": 0
          }
        ]
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_items": 1,
      "items_per_page": 10
    }
  }
}
```

### Get Issued Materials
**GET** `/api/stock/issued-materials`

Get issued materials history (Storekeeper only).

**Query Parameters:**
- `page` (integer): Page number
- `limit` (integer): Items per page
- `request_id` (integer): Filter by request ID
- `site_id` (integer): Filter by site
- `date_from` (string): Filter from date
- `date_to` (string): Filter to date

### Get Stock Movements
**GET** `/api/stock/movements`

Get all stock movements with filtering.

**Query Parameters:**
- `page` (integer): Page number
- `limit` (integer): Items per page
- `material_id` (integer): Filter by material
- `store_id` (integer): Filter by store
- `movement_type` (string): Filter by movement type
- `date_from` (string): Filter from date
- `date_to` (string): Filter to date

### Get Procurement Recommendations
**GET** `/api/stock/procurement-recommendations`

Get procurement recommendations based on stock levels.

**Query Parameters:**
- `page` (integer): Page number
- `limit` (integer): Items per page
- `store_id` (integer): Filter by store

### Get Low Stock Alerts
**GET** `/api/stock/alerts/low-stock`

Get low stock alerts.

**Query Parameters:**
- `page` (integer): Page number
- `limit` (integer): Items per page
- `store_id` (integer): Filter by store

### Create Stock
**POST** `/api/stock`

Create new stock entry.

**Request Body:**
```json
{
  "material_id": 1,
  "store_id": 1,
  "qty_on_hand": 100,
  "reorder_level": 20,
  "low_stock_threshold": 10,
  "unit_price": 15.50
}
```

### Get Stock by ID
**GET** `/api/stock/{id}`

Get specific stock entry by ID.

### Get Stock by Material ID
**GET** `/api/stock/material/{id}`

Get stock entries for specific material.

### Update Stock
**PUT** `/api/stock/{id}`

Update stock entry.

**Request Body:**
```json
{
  "qty_on_hand": 150,
  "reorder_level": 25,
  "low_stock_threshold": 15,
  "unit_price": 16.00
}
```

### Set Low Stock Threshold
**PUT** `/api/stock/{id}/threshold`

Set low stock threshold for specific stock.

**Request Body:**
```json
{
  "reorder_level": 30,
  "low_stock_threshold": 20
}
```

### Acknowledge Low Stock Alert
**PUT** `/api/stock/{id}/acknowledge-alert`

Acknowledge low stock alert.

**Request Body:**
```json
{
  "notes": "Alert acknowledged, procurement in progress"
}
```

---

## Materials Management

### Get All Materials
**GET** `/api/materials`

Get all materials with filtering and pagination.

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 10)
- `category_id` (integer): Filter by category
- `search` (string): Search in material name or code
- `unit_id` (integer): Filter by unit

### Get Material by ID
**GET** `/api/materials/{id}`

Get specific material by ID.

### Create Material
**POST** `/api/materials`

Create new material (Admin/Padiri/DSE only).

**Request Body:**
```json
{
  "name": "Portland Cement 50kg",
  "code": "CEM-001",
  "description": "High quality Portland cement",
  "category_id": 1,
  "unit_id": 1,
  "unit_price": 15.50,
  "supplier": "Cement Company Ltd"
}
```

### Update Material
**PUT** `/api/materials/{id}`

Update material (Admin/Padiri/DSE only).

**Request Body:**
```json
{
  "name": "Portland Cement 50kg - Updated",
  "unit_price": 16.00,
  "supplier": "New Cement Supplier"
}
```

### Delete Material
**DELETE** `/api/materials/{id}`

Delete material (Admin/Padiri/DSE only).

### Get Categories
**GET** `/api/materials/categories`

Get all material categories.

### Create Category
**POST** `/api/materials/categories`

Create new category (Admin/Padiri/DSE only).

**Request Body:**
```json
{
  "name": "Construction Materials",
  "description": "Materials used in construction"
}
```

### Get Category by ID
**GET** `/api/materials/categories/{id}`

Get specific category by ID.

### Update Category
**PUT** `/api/materials/categories/{id}`

Update category (Admin/Padiri/DSE only).

### Delete Category
**DELETE** `/api/materials/categories/{id}`

Delete category (Admin/Padiri/DSE only).

### Get Units
**GET** `/api/materials/units`

Get all units of measurement.

### Create Unit
**POST** `/api/materials/units`

Create new unit (Admin/Padiri/DSE only).

**Request Body:**
```json
{
  "name": "Kilograms",
  "code": "kg",
  "description": "Unit of mass"
}
```

### Get Unit by ID
**GET** `/api/materials/units/{id}`

Get specific unit by ID.

### Update Unit
**PUT** `/api/materials/units/{id}`

Update unit (Admin/Padiri/DSE only).

### Delete Unit
**DELETE** `/api/materials/units/{id}`

Delete unit (Admin/Padiri/DSE only).

---

## Sites Management

### Get All Sites
**GET** `/api/sites`

Get all sites with filtering.

**Query Parameters:**
- `page` (integer): Page number
- `limit` (integer): Items per page
- `search` (string): Search in site name or location

### Get Site by ID
**GET** `/api/sites/{id}`

Get specific site by ID.

### Create Site
**POST** `/api/sites`

Create new site (Admin/Padiri/DSE only).

**Request Body:**
```json
{
  "name": "Cathedral Construction Site",
  "location": "Kigali, Rwanda",
  "description": "Main construction site for cathedral project",
  "status": "ACTIVE"
}
```

### Update Site
**PUT** `/api/sites/{id}`

Update site (Admin/Padiri/DSE only).

### Delete Site
**DELETE** `/api/sites/{id}`

Delete site (Admin/Padiri/DSE only).

---

## Stores Management

### Get All Stores
**GET** `/api/stores`

Get all stores (Storekeeper/Admin only).

### Create Store
**POST** `/api/stores`

Create new store (Storekeeper/Admin only).

**Request Body:**
```json
{
  "name": "Main Warehouse",
  "location": "Kigali Central",
  "description": "Primary storage facility",
  "capacity": 1000,
  "status": "ACTIVE"
}
```

### Get Store by ID
**GET** `/api/stores/{id}`

Get specific store by ID.

### Update Store
**PUT** `/api/stores/{id}`

Update store (Storekeeper/Admin only).

### Delete Store
**DELETE** `/api/stores/{id}`

Delete store (Storekeeper/Admin only).

---

## Users Management

### Get All Users
**GET** `/api/users`

Get all users (Admin/Padiri/DSE only).

**Query Parameters:**
- `page` (integer): Page number
- `limit` (integer): Items per page
- `role` (string): Filter by role
- `status` (string): Filter by status (ACTIVE/INACTIVE)
- `search` (string): Search in name or email

### Get User by ID
**GET** `/api/users/{id}`

Get specific user by ID.

### Create User
**POST** `/api/users`

Create new user (Admin/Padiri only).

**Request Body:**
```json
{
  "full_name": "John Doe",
  "email": "john.doe@cdims.rw",
  "password": "password123",
  "role_id": 2,
  "phone": "+250788123456"
}
```

### Update User
**PUT** `/api/users/{id}`

Update user (Admin/Padiri only).

### Delete User
**DELETE** `/api/users/{id}`

Delete user (Admin/Padiri only).

### Toggle User Status
**PUT** `/api/users/{id}/toggle-status`

Toggle user active/inactive status (Admin/Padiri/DSE only).

### Get Roles
**GET** `/api/users/roles`

Get all available roles.

---

## Site Assignments

### Get All Site Assignments
**GET** `/api/site-assignments`

Get all site assignments (Admin/Padiri/DSE only).

### Get My Assigned Sites
**GET** `/api/site-assignments/my-sites`

Get sites assigned to current user (Site Engineer only).

### Assign Site to User
**POST** `/api/site-assignments`

Assign site to user (Admin/Padiri/DSE only).

**Request Body:**
```json
{
  "user_id": 1,
  "site_id": 1,
  "assigned_by": 1
}
```

### Update Site Assignment
**PUT** `/api/site-assignments/{id}`

Update site assignment (Admin/Padiri/DSE only).

### Remove Site Assignment
**DELETE** `/api/site-assignments/{id}`

Remove site assignment (Admin/Padiri/DSE only).

---

## Request Management (Additional Endpoints)

### Get My Requests
**GET** `/api/requests/my-requests`

Get requests created by current user (Site Engineer only).

### Get Site Engineer Requests
**GET** `/api/requests/site-engineer`

Get requests for site engineers with enhanced filtering.

### Get Available Sites
**GET** `/api/requests/available-sites`

Get sites available for current user to create requests.

### Get Requests by Site
**GET** `/api/requests/site/{site_id}`

Get requests for specific site.

### Get Request by ID
**GET** `/api/requests/{id}`

Get specific request by ID with full details.

### Update Request
**PUT** `/api/requests/{id}`

Update request (Site Engineer only).

### Modify Request Items
**PUT** `/api/requests/{id}/modify`

Modify request items (Admin/Padiri/DSE only).

### Close Request
**POST** `/api/requests/{id}/close`

Close request (Site Engineer only).

### Approve for Storekeeper
**POST** `/api/requests/{id}/approve-storekeeper`

Approve request for storekeeper (Padiri only).

### Reject Request
**POST** `/api/requests/{id}/reject`

Reject request (DSE/Padiri only).

### Get Request Comments
**GET** `/api/requests/{id}/comments`

Get comments for specific request.

### Add Comment
**POST** `/api/requests/{id}/comments`

Add comment to request.

### Get Request Attachments
**GET** `/api/requests/{id}/attachments`

Get attachments for specific request.

### Upload Attachment
**POST** `/api/requests/{id}/attachments`

Upload attachment to request.

---

## Authentication (Additional Endpoints)

### Logout
**POST** `/api/auth/logout`

Logout user and invalidate token.

### Get Profile
**GET** `/api/auth/profile`

Get current user profile.

### Update Profile
**PUT** `/api/auth/profile`

Update current user profile.

### Reset Password
**POST** `/api/auth/reset-password`

Reset user password via email.

### Delete Account
**DELETE** `/api/auth/delete-account`

Delete current user account.

---

## Admin Functions

### Get Audit Logs
**GET** `/api/admin/audit-logs`

Get comprehensive audit logs (Admin/Padiri only).

**Query Parameters:**
- `page` (integer): Page number
- `limit` (integer): Items per page
- `user_id` (integer): Filter by user
- `action` (string): Filter by action
- `entity` (string): Filter by entity type
- `date_from` (string): Filter from date
- `date_to` (string): Filter to date

### Get System Statistics
**GET** `/api/admin/system-stats`

Get system performance statistics (Admin/Padiri only).

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 25,
    "activeUsers": 20,
    "totalRequests": 150,
    "pendingRequests": 5,
    "totalMaterials": 50,
    "lowStockItems": 3,
    "systemUptime": "5 days, 12 hours",
    "databaseSize": "25.5 MB"
  }
}
```

### System Configuration Management
**GET** `/api/admin/system-configs`

Get all system configurations.

**PUT** `/api/admin/system-configs/{key}`

Update system configuration.

**Request Body:**
```json
{
  "value": "new_value",
  "description": "Updated configuration description"
}
```

### Database Maintenance
**GET** `/api/admin/database/stats`

Get database statistics.

**POST** `/api/admin/database/backup`

Create database backup.

**GET** `/api/admin/database/health`

Get database health status.

**POST** `/api/admin/database/optimize`

Optimize database performance.

### Export Functionality
**GET** `/api/admin/export/users`

Export users data to CSV/JSON.

**Query Parameters:**
- `format` (string): Export format (csv/json)
- `date_from` (string): Filter from date
- `date_to` (string): Filter to date

**GET** `/api/admin/export/requests`

Export requests data.

**GET** `/api/admin/export/materials`

Export materials data.

**GET** `/api/admin/export/stock`

Export stock data.

**GET** `/api/admin/export/audit-logs`

Export audit logs data.

---

## Enhanced Workflow Features

### 1. Item Modifications During Approval

PADIRI and DIOCESAN_SITE_ENGINEER can modify request items during approval:

- **Modify Quantities**: Change `qty_approved`
- **Replace Materials**: Change `material_id`
- **Add New Items**: Insert additional items
- **Remove Items**: Delete unwanted items
- **Update Notes**: Modify item descriptions

### 2. Automatic Remaining Quantity Updates

When storekeeper issues partial quantities:
- `qty_approved` is automatically reduced by issued amount
- System tracks remaining approved quantities
- Status changes to `PARTIALLY_ISSUED` or `ISSUED` accordingly

### 3. Enhanced Status Workflow

```
PENDING → VERIFIED → APPROVED → PARTIALLY_ISSUED → ISSUED → RECEIVED → CLOSED
```

### 4. Decimal Precision

All quantity calculations use proper decimal precision:
- Stock additions: `parseFloat()` for accurate arithmetic
- Quantity updates: Proper decimal handling
- Display: Consistent decimal formatting

---

## Usage Examples

### Complete Workflow Example (PENDING → RECEIVED)

**Step 1: Create Request** (Site Engineer):
```bash
curl -X POST http://localhost:3000/api/requests \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "site_id": 1,
    "notes": "Foundation materials for cathedral construction",
    "items": [
      {"material_id": 1, "qty_requested": 20, "notes": "Portland cement for foundation"},
      {"material_id": 2, "qty_requested": 50, "notes": "Steel reinforcement bars"}
    ]
  }'
```

**Step 2: DSE Review and Verification**:
```bash
curl -X POST http://localhost:3000/api/requests/1/approve \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "level": "DSE",
    "comment": "Verified with quantity adjustments based on site assessment",
    "item_modifications": [
      {"request_item_id": 1, "qty_approved": 15, "notes": "Reduced based on actual needs"}
    ],
    "items_to_add": [
      {"material_id": 3, "qty_requested": 10, "qty_approved": 10, "notes": "Additional nails"}
    ],
    "modification_reason": "Site assessment showed different requirements"
  }'
```

**Step 3: PADIRI Final Approval**:
```bash
curl -X POST http://localhost:3000/api/requests/1/approve \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "level": "PADIRI",
    "comment": "Final approval granted for construction materials"
  }'
```

**Step 4: Storekeeper Issues Materials**:
```bash
curl -X POST http://localhost:3000/api/stock/issue-materials \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "request_id": 1,
    "items": [
      {"request_item_id": 1, "qty_issued": 10, "store_id": 1, "notes": "Partial issue for urgent work"},
      {"request_item_id": 2, "qty_issued": 25, "store_id": 1, "notes": "Steel bars issued"}
    ]
  }'
```

**Step 5: Site Engineer Receives Materials**:
```bash
curl -X POST http://localhost:3000/api/requests/1/receive \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"request_item_id": 1, "qty_received": 10, "notes": "Cement received at site"},
      {"request_item_id": 2, "qty_received": 25, "notes": "Steel bars received"}
    ]
  }'
```

**Step 6: Check Final Status**:
```bash
curl "http://localhost:3000/api/requests/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Filtering Examples

**Get requests by date range:**
```bash
curl "http://localhost:3000/api/requests?date_from=2025-01-01&date_to=2025-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get stock history for specific material:**
```bash
curl "http://localhost:3000/api/stock/history?material_id=1&movement_type=OUT" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Export users data:**
```bash
curl "http://localhost:3000/api/admin/export/users?format=csv" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get issuable requests (Storekeeper):**
```bash
curl "http://localhost:3000/api/stock/issuable-requests?site_id=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get issued materials history:**
```bash
curl "http://localhost:3000/api/stock/issued-materials?date_from=2025-01-01" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get low stock alerts:**
```bash
curl "http://localhost:3000/api/stock/alerts/low-stock" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Create new material:**
```bash
curl -X POST http://localhost:3000/api/materials \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Steel Bars 12mm",
    "code": "STL-001",
    "description": "Reinforcement steel bars",
    "category_id": 1,
    "unit_id": 1,
    "unit_price": 25.00,
    "supplier": "Steel Company Ltd"
  }'
```

**Get all materials with filtering:**
```bash
curl "http://localhost:3000/api/materials?category_id=1&search=cement" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Create new site:**
```bash
curl -X POST http://localhost:3000/api/sites \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Construction Site",
    "location": "Kigali, Rwanda",
    "description": "Secondary construction site",
    "status": "ACTIVE"
  }'
```

**Assign site to user:**
```bash
curl -X POST http://localhost:3000/api/site-assignments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 2,
    "site_id": 1,
    "assigned_by": 1
  }'
```

**Get my assigned sites (Site Engineer):**
```bash
curl "http://localhost:3000/api/site-assignments/my-sites" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get user activity:**
```bash
curl "http://localhost:3000/api/admin/user-activity/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Create database backup:**
```bash
curl -X POST http://localhost:3000/api/admin/database/backup \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "backup_name": "daily_backup_2025-09-26"
  }'
```

**Get database health:**
```bash
curl "http://localhost:3000/api/admin/database/health" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Optimize database:**
```bash
curl -X POST http://localhost:3000/api/admin/database/optimize \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Generate system report:**
```bash
curl "http://localhost:3000/api/admin/export/system-report?format=json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "statusCode": 400,
    "isOperational": true
  }
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

---

## Authentication Headers

All protected endpoints require the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Rate Limiting

API endpoints are protected by rate limiting:
- 100 requests per 15 minutes per IP
- 1000 requests per 15 minutes for authenticated users

---

## Testing Credentials

### Complete User Role Testing Credentials

**🔐 ADMIN & PADIRI - FULL SYSTEM ACCESS (LOGIN NORMALLY):**
```
Email: admin@cdims.rw
Password: admin123
Access: Complete system control, all permissions, override restrictions
✅ LOGIN NORMALLY - NO PASSWORD CHANGE REQUIRED

Email: padiri@cdims.rw  
Password: password123
Access: Complete system control, all permissions, override restrictions
✅ LOGIN NORMALLY - NO PASSWORD CHANGE REQUIRED
```

**🔐 DIOCESAN_SITE_ENGINEER (DSE) - VERIFICATION & MODIFICATION:**
```
Email: dse@cdims.rw
Password: password123
Access: Verify requests, modify items, view all requests, add/remove items
⚠️  MUST CHANGE PASSWORD ON FIRST LOGIN
```

**🔐 SITE_ENGINEER - REQUEST CREATION & RECEIPT:**
```
Email: site.engineer@cdims.rw
Password: password123
Access: Create requests, receive materials, view own requests, update requests
⚠️  MUST CHANGE PASSWORD ON FIRST LOGIN
```

**🔐 STOREKEEPER - MATERIAL ISSUANCE & STOCK MANAGEMENT:**
```
Email: storekeeper@cdims.rw
Password: password123
Access: Issue materials, manage stock, view issuable requests, stock history
⚠️  MUST CHANGE PASSWORD ON FIRST LOGIN
```

**🔐 REPORTS - ANALYTICS & REPORTING:**
```
Email: reports@cdims.rw
Password: password123
Access: View reports, generate analytics, export data
⚠️  MUST CHANGE PASSWORD ON FIRST LOGIN
```

### Testing Workflow Examples

**1. Login as Site Engineer:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "site.engineer@cdims.rw",
    "password": "password123"
  }'
```

**2. Login as DSE:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dse@cdims.rw",
    "password": "password123"
  }'
```

**3. Login as PADIRI:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "padiri@cdims.rw",
    "password": "password123"
  }'
```

**4. Login as Storekeeper:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "storekeeper@cdims.rw",
    "password": "password123"
  }'
```

**5. Login as Admin:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cdims.rw",
    "password": "password123"
  }'
```

### Role-Based Testing Scenarios

**🔧 ADMIN/PADIRI Testing:**
- Can perform ALL actions from any role
- Access all endpoints regardless of role restrictions
- Override approval workflows
- Manage users, system configuration, database

**🔧 DSE Testing:**
- Verify requests with item modifications
- Add/remove items during verification
- View all requests across all sites
- Approve requests for storekeeper

**🔧 Site Engineer Testing:**
- Create material requests
- Receive materials at site
- View own requests with filtering
- Update request details

**🔧 Storekeeper Testing:**
- View issuable requests
- Issue materials (partial or full)
- Manage stock levels and history
- Add stock quantities

**🔧 Reports Testing:**
- Generate all types of reports
- Export data in various formats
- View analytics and statistics

### Quick Test Commands

**Test Server Health:**
```bash
curl http://localhost:3000/api/health
```

**Test Authentication:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@cdims.rw", "password": "password123"}'
```

**Test Role Access (with token):**
```bash
# Test admin access to all endpoints
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/users
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/requests
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/stock
```

### Forced Password Change for Regular Users

**🔒 Security Enhancement:** DSE, SITE_ENGINEER, STOREKEEPER, and REPORTS users are forced to change their password on first login for security reasons. ADMIN and PADIRI users can login normally without password change requirements.

**Workflow:**
1. **Login with initial credentials** - User gets a token but access is restricted
2. **Access any protected endpoint** - Returns 403 Forbidden with `requires_password_change: true`
3. **Change password** - Use the change password endpoint
4. **Full access granted** - User can now access all system features

**Example Workflow:**
```bash
# 1. Login as DSE (gets token but restricted access)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "dse@cdims.rw", "password": "password123"}'

# Response: {"success":true,"data":{"token":"...","session_id":"...","user":{...},"session_reset":true}}

# 2. Try to access protected endpoint (gets 403)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/users

# Response: {"success":false,"message":"Password change required on first login.","requires_password_change":true}

# 3. Change password
curl -X PUT http://localhost:3000/api/auth/change-password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "password123",
    "new_password": "newdse123"
  }'

# Response: {"success":true,"message":"Password changed successfully"}

# 4. Now full access is granted
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/users
```

### Session Reset After Login

**🔄 Session Management:** All successful logins now include session reset functionality:
- **session_id**: Unique session identifier generated for each login
- **session_reset**: Boolean flag indicating session has been reset
- **Enhanced Security**: Prevents session hijacking and ensures fresh sessions

**Login Response Example:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "session_id": "0713761f-a327-436c-bde9-ffc8f2b112b3",
    "user": {
      "id": 1,
      "full_name": "System Administrator",
      "email": "admin@cdims.rw",
      "role": { "name": "ADMIN" }
    }
  },
  "message": "Login successful",
  "session_reset": true
}
```

### Password Change on First Login

**Note:** Regular users (DSE, SITE_ENGINEER, STOREKEEPER, REPORTS) are required to change their password on first login:
```bash
curl -X PUT http://localhost:3000/api/auth/change-password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "password123",
    "new_password": "newpassword123"
  }'
```

### Setup Instructions

**1. Database Setup:**
```bash
# Create database tables
npm run migrate

# Seed initial data
npm run seed

# Create secure test users (with forced password change for ADMIN/PADIRI)
node create-secure-test-users.js
```

**2. Start Server:**
```bash
npm run dev
```

**3. Test Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@cdims.rw", "password": "admin123"}'
```

### Troubleshooting

**If login fails with "Invalid credentials":**

1. **Check Database Setup:**
   - Ensure migrations have run: `npm run migrate`
   - Ensure data is seeded: `npm run seed`
   - Create test users: `node create-test-users.js`

2. **Check Server Logs:**
   - Look for database connection errors
   - Check for JWT_SECRET configuration
   - Verify environment variables

3. **Verify User Exists:**
   - Check if user exists in database
   - Verify password hash is correct
   - Ensure user is active

4. **Common Issues:**
   - JWT_SECRET not set in environment
   - Database connection failed
   - User not created properly
   - Password hash mismatch

**Environment Variables Required:**
```bash
JWT_SECRET=your_jwt_secret_here
DB_HOST=localhost
DB_NAME=cdims
DB_USER=root
DB_PASS=your_password
```

---

## Support

For technical support or questions about the API, please contact the development team or refer to the Swagger documentation at `/api-docs` when the server is running.
