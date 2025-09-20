const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CDIMS API',
      version: '1.0.0',
      description: 'Catholic Diocese Infrastructure Management System API Documentation',
      contact: {
        name: 'CDIMS Support',
        email: 'support@cdims.rw'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://cdims.onrender.com' 
          : 'http://localhost:3000',
        description: process.env.NODE_ENV === 'production' 
          ? 'Production server' 
          : 'Development server'
      },
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://cdims-backend.onrender.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            full_name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            role: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                name: { type: 'string' }
              }
            },
            active: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        Site: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            code: { type: 'string' },
            name: { type: 'string' },
            location: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        Material: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            description: { type: 'string' },
            code: { type: 'string' },
            specifications: { type: 'string' },
            unit_price: { type: 'number' },
            category: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                name: { type: 'string' }
              }
            },
            unit: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                name: { type: 'string' },
                symbol: { type: 'string' }
              }
            },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        Request: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            site_id: { type: 'integer' },
            requested_by: { type: 'integer' },
            notes: { type: 'string' },
            status: { 
              type: 'string',
              enum: ['PENDING', 'DSE_REVIEW', 'WAITING_PADIRI_REVIEW', 'APPROVED', 'REJECTED', 'ISSUED']
            },
            site: { $ref: '#/components/schemas/Site' },
            requestedBy: { $ref: '#/components/schemas/User' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  material_id: { type: 'integer' },
                  unit_id: { type: 'integer' },
                  qty_requested: { type: 'number' },
                  qty_approved: { type: 'number' },
                  material: { $ref: '#/components/schemas/Material' }
                }
              }
            },
            approvals: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  level: { type: 'string', enum: ['DSE', 'PADIRI'] },
                  action: { type: 'string', enum: ['APPROVED', 'REJECTED', 'NEEDS_CHANGES'] },
                  comment: { type: 'string' },
                  reviewer: { $ref: '#/components/schemas/User' },
                  created_at: { type: 'string', format: 'date-time' }
                }
              }
            },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        Stock: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            store_id: { type: 'integer' },
            material_id: { type: 'integer' },
            qty_on_hand: { type: 'number' },
            reorder_level: { type: 'number' },
            low_stock_threshold: { type: 'number' },
            low_stock_alert: { type: 'boolean' },
            material: { $ref: '#/components/schemas/Material' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        PurchaseOrder: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            supplier_id: { type: 'integer' },
            created_by: { type: 'integer' },
            status: { 
              type: 'string',
              enum: ['DRAFT', 'SENT', 'RECEIVED', 'CANCELLED']
            },
            supplier: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                name: { type: 'string' },
                contact: { type: 'string' },
                phone: { type: 'string' },
                email: { type: 'string' }
              }
            },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  material_id: { type: 'integer' },
                  unit_id: { type: 'integer' },
                  qty_ordered: { type: 'number' },
                  unit_price: { type: 'number' },
                  material: { $ref: '#/components/schemas/Material' }
                }
              }
            },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        Store: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            code: { type: 'string' },
            name: { type: 'string' },
            location: { type: 'string' },
            description: { type: 'string' },
            manager_name: { type: 'string' },
            contact_phone: { type: 'string' },
            contact_email: { type: 'string', format: 'email' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        StockMovement: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            store_id: { type: 'integer' },
            material_id: { type: 'integer' },
            movement_type: { 
              type: 'string',
              enum: ['IN', 'OUT', 'ADJUSTMENT']
            },
            source_type: { 
              type: 'string',
              enum: ['GRN', 'ISSUE', 'ADJUSTMENT']
            },
            source_id: { type: 'integer' },
            qty: { type: 'number' },
            unit_price: { type: 'number' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            current_page: { type: 'integer' },
            total_pages: { type: 'integer' },
            total_items: { type: 'integer' },
            items_per_page: { type: 'integer' },
            has_next: { type: 'boolean' },
            has_prev: { type: 'boolean' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = specs;
