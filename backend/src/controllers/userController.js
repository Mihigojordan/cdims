const { User, Role } = require('../../models');

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, active } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (role) whereClause.role_id = role;
    if (active !== undefined) whereClause.active = active === 'true';

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      include: [{
        model: Role,
        as: 'role'
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_items: count,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      include: [{
        model: Role,
        as: 'role'
      }]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { role_id, full_name, email, phone, password } = req.body;

    if (!role_id || !full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Role ID, full name, email, and password are required'
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists'
      });
    }

    const user = await User.create({
      role_id,
      full_name,
      email,
      phone,
      password_hash: password
    });

    // Fetch user with role
    const userWithRole = await User.findByPk(user.id, {
      include: [{
        model: Role,
        as: 'role'
      }]
    });

    res.status(201).json({
      success: true,
      data: { user: userWithRole },
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role_id, full_name, email, phone, active } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email already exists (excluding current user)
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    // Update user fields
    if (role_id) user.role_id = role_id;
    if (full_name) user.full_name = full_name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (active !== undefined) user.active = active;

    await user.save();

    // Fetch updated user with role
    const updatedUser = await User.findByPk(user.id, {
      include: [{
        model: Role,
        as: 'role'
      }]
    });

    res.json({
      success: true,
      data: { user: updatedUser },
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Hard delete - permanently remove the user from database
    await user.destroy();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    if (active === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Active status is required'
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user active status
    user.active = active;
    await user.save();

    // Fetch updated user with role
    const updatedUser = await User.findByPk(user.id, {
      include: [{
        model: Role,
        as: 'role'
      }]
    });

    res.json({
      success: true,
      data: { user: updatedUser },
      message: `User ${active ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      order: [['id', 'ASC']]
    });

    res.json({
      success: true,
      data: { roles }
    });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getRoles
};
