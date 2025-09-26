const { Sequelize } = require('sequelize');
const { sequelize } = require('../src/config/database');

// Import all models
const Role = require('./Role');
const User = require('./User');
const Site = require('./Site');
const Category = require('./Category');
const Unit = require('./Unit');
const Material = require('./Material');
const Store = require('./Store');
const Stock = require('./Stock');
const StockMovement = require('./StockMovement');
const StockHistory = require('./StockHistory');
const Request = require('./Request');
const RequestItem = require('./RequestItem');
const Approval = require('./Approval');
const Comment = require('./Comment');
const Attachment = require('./Attachment');
const Supplier = require('./Supplier');
const PurchaseOrder = require('./PurchaseOrder');
const PurchaseOrderItem = require('./PurchaseOrderItem');
const GoodsReceipt = require('./GoodsReceipt');
const GoodsReceiptItem = require('./GoodsReceiptItem');
const Issue = require('./Issue');
const IssueItem = require('./IssueItem');
const AuditLog = require('./AuditLog')(sequelize);
const SystemConfig = require('./SystemConfig')(sequelize);
const SiteAssignment = require('./SiteAssignment');

// Define associations
const defineAssociations = () => {
  // User associations
  User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
  Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });

  // Request associations
  Request.belongsTo(Site, { foreignKey: 'site_id', as: 'site' });
  Request.belongsTo(User, { foreignKey: 'requested_by', as: 'requestedBy' });
  Request.hasMany(RequestItem, { foreignKey: 'request_id', as: 'items' });
  Request.hasMany(Approval, { foreignKey: 'request_id', as: 'approvals' });
  Request.hasMany(Comment, { foreignKey: 'request_id', as: 'comments' });
  Request.hasMany(Attachment, { foreignKey: 'request_id', as: 'attachments' });
  Request.hasMany(Issue, { foreignKey: 'request_id', as: 'issues' });

  // RequestItem associations
  RequestItem.belongsTo(Request, { foreignKey: 'request_id', as: 'request' });
  RequestItem.belongsTo(Material, { foreignKey: 'material_id', as: 'material' });
  RequestItem.belongsTo(Unit, { foreignKey: 'unit_id', as: 'unit' });
  RequestItem.hasMany(IssueItem, { foreignKey: 'request_item_id', as: 'issueItems' });

  // Approval associations
  Approval.belongsTo(Request, { foreignKey: 'request_id', as: 'request' });
  Approval.belongsTo(User, { foreignKey: 'reviewer_id', as: 'reviewer' });

  // Comment associations
  Comment.belongsTo(Request, { foreignKey: 'request_id', as: 'request' });
  Comment.belongsTo(User, { foreignKey: 'author_id', as: 'author' });

  // Attachment associations
  Attachment.belongsTo(Request, { foreignKey: 'request_id', as: 'request' });
  Attachment.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploadedBy' });

  // Material associations
  Material.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
  Material.belongsTo(Unit, { foreignKey: 'unit_id', as: 'unit' });
  Material.hasMany(Stock, { foreignKey: 'material_id', as: 'stock' });
  Material.hasMany(StockMovement, { foreignKey: 'material_id', as: 'stockMovements' });
  Material.hasMany(RequestItem, { foreignKey: 'material_id', as: 'requestItems' });
  Material.hasMany(PurchaseOrderItem, { foreignKey: 'material_id', as: 'purchaseOrderItems' });
  Material.hasMany(GoodsReceiptItem, { foreignKey: 'material_id', as: 'goodsReceiptItems' });
  Material.hasMany(IssueItem, { foreignKey: 'material_id', as: 'issueItems' });

  // Category associations
  Category.hasMany(Material, { foreignKey: 'category_id', as: 'materials' });
  Category.belongsTo(Category, { foreignKey: 'parent_id', as: 'parent' });
  Category.hasMany(Category, { foreignKey: 'parent_id', as: 'children' });

  // Unit associations
  Unit.hasMany(Material, { foreignKey: 'unit_id', as: 'materials' });
  Unit.hasMany(RequestItem, { foreignKey: 'unit_id', as: 'requestItems' });
  Unit.hasMany(PurchaseOrderItem, { foreignKey: 'unit_id', as: 'purchaseOrderItems' });
  Unit.hasMany(GoodsReceiptItem, { foreignKey: 'unit_id', as: 'goodsReceiptItems' });
  Unit.hasMany(IssueItem, { foreignKey: 'unit_id', as: 'issueItems' });


  // Stock associations
  Stock.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });
  Stock.belongsTo(Material, { foreignKey: 'material_id', as: 'material' });

 // StockMovement associations
StockMovement.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });
StockMovement.belongsTo(Material, { foreignKey: 'material_id', as: 'material' });
StockMovement.belongsTo(User, { foreignKey: 'created_by', as: 'createdBy' });
StockMovement.belongsTo(Request, { foreignKey: 'source_id', as: 'source' }); // <-- add this


  // Store associations
  Store.hasMany(Stock, { foreignKey: 'store_id', as: 'stock' });
  Store.hasMany(StockMovement, { foreignKey: 'store_id', as: 'stockMovements' });
  Store.hasMany(GoodsReceipt, { foreignKey: 'store_id', as: 'goodsReceipts' });
  Store.hasMany(Issue, { foreignKey: 'store_id', as: 'issues' });

  // Site associations
  Site.hasMany(Request, { foreignKey: 'site_id', as: 'requests' });
  Site.hasMany(SiteAssignment, { foreignKey: 'site_id', as: 'assignments' });
  Site.belongsToMany(User, { through: SiteAssignment, foreignKey: 'site_id', otherKey: 'user_id', as: 'assignedUsers' });


  // Supplier associations
  Supplier.hasMany(PurchaseOrder, { foreignKey: 'supplier_id', as: 'purchaseOrders' });

  // PurchaseOrder associations
  PurchaseOrder.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });
  PurchaseOrder.belongsTo(User, { foreignKey: 'created_by', as: 'createdBy' });
  PurchaseOrder.hasMany(PurchaseOrderItem, { foreignKey: 'purchase_order_id', as: 'items' });
  PurchaseOrder.hasMany(GoodsReceipt, { foreignKey: 'purchase_order_id', as: 'goodsReceipts' });

  // PurchaseOrderItem associations
  PurchaseOrderItem.belongsTo(PurchaseOrder, { foreignKey: 'purchase_order_id', as: 'purchaseOrder' });
  PurchaseOrderItem.belongsTo(Material, { foreignKey: 'material_id', as: 'material' });
  PurchaseOrderItem.belongsTo(Unit, { foreignKey: 'unit_id', as: 'unit' });

  // GoodsReceipt associations
  GoodsReceipt.belongsTo(PurchaseOrder, { foreignKey: 'purchase_order_id', as: 'purchaseOrder' });
  GoodsReceipt.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });
  GoodsReceipt.belongsTo(User, { foreignKey: 'received_by', as: 'receivedBy' });
  GoodsReceipt.hasMany(GoodsReceiptItem, { foreignKey: 'goods_receipt_id', as: 'items' });

  // GoodsReceiptItem associations
  GoodsReceiptItem.belongsTo(GoodsReceipt, { foreignKey: 'goods_receipt_id', as: 'goodsReceipt' });
  GoodsReceiptItem.belongsTo(Material, { foreignKey: 'material_id', as: 'material' });
  GoodsReceiptItem.belongsTo(Unit, { foreignKey: 'unit_id', as: 'unit' });

  // Issue associations
  Issue.belongsTo(Request, { foreignKey: 'request_id', as: 'request' });
  Issue.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });
  Issue.belongsTo(User, { foreignKey: 'issued_by', as: 'issuedBy' });
  Issue.belongsTo(User, { foreignKey: 'issued_to', as: 'issuedTo' });
  Issue.hasMany(IssueItem, { foreignKey: 'issue_id', as: 'items' });

  // IssueItem associations
  IssueItem.belongsTo(Issue, { foreignKey: 'issue_id', as: 'issue' });
  IssueItem.belongsTo(RequestItem, { foreignKey: 'request_item_id', as: 'requestItem' });
  IssueItem.belongsTo(Material, { foreignKey: 'material_id', as: 'material' });
  IssueItem.belongsTo(Unit, { foreignKey: 'unit_id', as: 'unit' });

  // AuditLog associations
  AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // SiteAssignment associations
  SiteAssignment.belongsTo(Site, { foreignKey: 'site_id', as: 'site' });
  SiteAssignment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  SiteAssignment.belongsTo(User, { foreignKey: 'assigned_by', as: 'assignedBy' });
  User.hasMany(SiteAssignment, { foreignKey: 'user_id', as: 'siteAssignments' });
  User.belongsToMany(Site, { through: SiteAssignment, foreignKey: 'user_id', otherKey: 'site_id', as: 'assignedSites' });

  // StockHistory associations
  StockHistory.belongsTo(Stock, { foreignKey: 'stock_id', as: 'stock' });
  StockHistory.belongsTo(Material, { foreignKey: 'material_id', as: 'material' });
  StockHistory.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });
  StockHistory.belongsTo(User, { foreignKey: 'created_by', as: 'createdBy' });
  Stock.hasMany(StockHistory, { foreignKey: 'stock_id', as: 'history' });
  Material.hasMany(StockHistory, { foreignKey: 'material_id', as: 'stockHistory' });
  Store.hasMany(StockHistory, { foreignKey: 'store_id', as: 'stockHistory' });

  // AuditLog associations
  AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'auditUser' });
  User.hasMany(AuditLog, { foreignKey: 'user_id', as: 'auditLogs' });

  // SystemConfig associations
  SystemConfig.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
  SystemConfig.belongsTo(User, { foreignKey: 'updated_by', as: 'updater' });
  User.hasMany(SystemConfig, { foreignKey: 'created_by', as: 'createdConfigs' });
  User.hasMany(SystemConfig, { foreignKey: 'updated_by', as: 'updatedConfigs' });
};

// Initialize associations
defineAssociations();

module.exports = {
  sequelize,
  Sequelize,
  Role,
  User,
  Site,
  Category,
  Unit,
  Material,
  Store,
  Stock,
  StockMovement,
  StockHistory,
  Request,
  RequestItem,
  Approval,
  Comment,
  Attachment,
  Supplier,
  PurchaseOrder,
  PurchaseOrderItem,
  GoodsReceipt,
  GoodsReceiptItem,
  Issue,
  IssueItem,
  AuditLog,
  SystemConfig,
  SiteAssignment
};
