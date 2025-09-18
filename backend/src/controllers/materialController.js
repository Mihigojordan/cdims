const { Material, Category, Unit } = require('../../models');

const getAllMaterials = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category_id, active } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (category_id) whereClause.category_id = category_id;
    if (active !== undefined) whereClause.active = active === 'true';
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { code: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: materials } = await Material.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: 'category'
        },
        {
          model: Unit,
          as: 'unit'
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        materials,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_items: count,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all materials error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getMaterialById = async (req, res) => {
  try {
    const { id } = req.params;

    const material = await Material.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category'
        },
        {
          model: Unit,
          as: 'unit'
        }
      ]
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    res.json({
      success: true,
      data: { material }
    });
  } catch (error) {
    console.error('Get material by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const createMaterial = async (req, res) => {
  try {
    const { code, name, specification, category_id, unit_id, unit_price } = req.body;

    if (!name || !unit_id) {
      return res.status(400).json({
        success: false,
        message: 'Name and unit are required'
      });
    }

    const material = await Material.create({
      code,
      name,
      specification,
      category_id,
      unit_id,
      unit_price
    });

    // Fetch material with relations
    const materialWithRelations = await Material.findByPk(material.id, {
      include: [
        {
          model: Category,
          as: 'category'
        },
        {
          model: Unit,
          as: 'unit'
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: { material: materialWithRelations },
      message: 'Material created successfully'
    });
  } catch (error) {
    console.error('Create material error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, specification, category_id, unit_id, unit_price, active } = req.body;

    const material = await Material.findByPk(id);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Update material fields
    if (code) material.code = code;
    if (name) material.name = name;
    if (specification !== undefined) material.specification = specification;
    if (category_id) material.category_id = category_id;
    if (unit_id) material.unit_id = unit_id;
    if (unit_price !== undefined) material.unit_price = unit_price;
    if (active !== undefined) material.active = active;

    await material.save();

    // Fetch updated material with relations
    const updatedMaterial = await Material.findByPk(material.id, {
      include: [
        {
          model: Category,
          as: 'category'
        },
        {
          model: Unit,
          as: 'unit'
        }
      ]
    });

    res.json({
      success: true,
      data: { material: updatedMaterial },
      message: 'Material updated successfully'
    });
  } catch (error) {
    console.error('Update material error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    const material = await Material.findByPk(id);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Soft delete by setting active to false
    material.active = false;
    await material.save();

    res.json({
      success: true,
      message: 'Material deleted successfully'
    });
  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, parent_id } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    const category = await Category.create({
      name,
      parent_id
    });

    res.status(201).json({
      success: true,
      data: { category },
      message: 'Category created successfully'
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getUnits = async (req, res) => {
  try {
    const units = await Unit.findAll({
      order: [['name', 'ASC']]
    });

    // Map code field to symbol for API response
    const mappedUnits = units.map(unit => ({
      ...unit.toJSON(),
      symbol: unit.code,
      code: undefined // Remove code field from response
    }));

    res.json({
      success: true,
      data: { units: mappedUnits }
    });
  } catch (error) {
    console.error('Get units error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const createUnit = async (req, res) => {
  try {
    const { name, symbol, description } = req.body;

    if (!name || !symbol) {
      return res.status(400).json({
        success: false,
        message: 'Unit name and symbol are required'
      });
    }

    const unit = await Unit.create({
      code: symbol, // Map symbol to code field in database
      name
    });

    // Map code field to symbol for API response
    const mappedUnit = {
      ...unit.toJSON(),
      symbol: unit.code,
      code: undefined // Remove code field from response
    };

    res.status(201).json({
      success: true,
      data: { unit: mappedUnit },
      message: 'Unit created successfully'
    });
  } catch (error) {
    console.error('Create unit error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: { category }
    });
  } catch (error) {
    console.error('Get category by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    await category.update({
      name: name || category.name,
      description: description || category.description
    });

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: { category }
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    await category.destroy();

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getUnitById = async (req, res) => {
  try {
    const { id } = req.params;
    const unit = await Unit.findByPk(id);

    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found'
      });
    }

    // Map code field to symbol for API response
    const mappedUnit = {
      ...unit.toJSON(),
      symbol: unit.code,
      code: undefined // Remove code field from response
    };

    res.json({
      success: true,
      data: { unit: mappedUnit }
    });
  } catch (error) {
    console.error('Get unit by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const updateUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, symbol, description } = req.body;

    const unit = await Unit.findByPk(id);
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found'
      });
    }

    await unit.update({
      name: name || unit.name,
      code: symbol || unit.code // Map symbol to code field in database
    });

    // Map code field to symbol for API response
    const mappedUnit = {
      ...unit.toJSON(),
      symbol: unit.code,
      code: undefined // Remove code field from response
    };

    res.json({
      success: true,
      message: 'Unit updated successfully',
      data: { unit: mappedUnit }
    });
  } catch (error) {
    console.error('Update unit error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const deleteUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const unit = await Unit.findByPk(id);

    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found'
      });
    }

    await unit.destroy();

    res.json({
      success: true,
      message: 'Unit deleted successfully'
    });
  } catch (error) {
    console.error('Delete unit error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getCategories,
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getUnits,
  createUnit,
  getUnitById,
  updateUnit,
  deleteUnit
};
