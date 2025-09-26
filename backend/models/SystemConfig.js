const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SystemConfig = sequelize.define('SystemConfig', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: 'Configuration key'
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Configuration value (JSON or string)'
    },
    type: {
      type: DataTypes.ENUM('STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'ARRAY'),
      allowNull: false,
      defaultValue: 'STRING',
      comment: 'Data type of the configuration value'
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'GENERAL',
      comment: 'Configuration category'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Description of what this configuration does'
    },
    is_editable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether this configuration can be edited via API'
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether this configuration is visible to non-admin users'
    },
    validation_rules: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Validation rules for the configuration value'
    },
    created_by: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'User who created this configuration'
    },
    updated_by: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'User who last updated this configuration'
    }
  }, {
    tableName: 'system_configs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['key']
      },
      {
        fields: ['category']
      },
      {
        fields: ['is_public']
      },
      {
        fields: ['is_editable']
      }
    ],
    hooks: {
      beforeUpdate: (config) => {
        // Parse value based on type before saving
        if (config.type === 'JSON' || config.type === 'ARRAY') {
          if (typeof config.value === 'string') {
            try {
              config.value = JSON.parse(config.value);
            } catch (e) {
              throw new Error(`Invalid JSON format for configuration ${config.key}`);
            }
          }
        } else if (config.type === 'NUMBER') {
          const numValue = parseFloat(config.value);
          if (isNaN(numValue)) {
            throw new Error(`Invalid number format for configuration ${config.key}`);
          }
          config.value = numValue.toString();
        } else if (config.type === 'BOOLEAN') {
          config.value = config.value === 'true' || config.value === true ? 'true' : 'false';
        }
      }
    }
  });

  SystemConfig.associate = (models) => {
    SystemConfig.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator'
    });
    SystemConfig.belongsTo(models.User, {
      foreignKey: 'updated_by',
      as: 'updater'
    });
  };

  // Static method to get configuration value
  SystemConfig.getConfig = async function(key, defaultValue = null) {
    try {
      const config = await this.findOne({ where: { key } });
      if (!config) return defaultValue;

      // Parse value based on type
      switch (config.type) {
        case 'JSON':
        case 'ARRAY':
          return typeof config.value === 'string' ? JSON.parse(config.value) : config.value;
        case 'NUMBER':
          return parseFloat(config.value);
        case 'BOOLEAN':
          return config.value === 'true';
        default:
          return config.value;
      }
    } catch (error) {
      console.error(`Error getting config ${key}:`, error);
      return defaultValue;
    }
  };

  // Static method to set configuration value
  SystemConfig.setConfig = async function(key, value, userId = null) {
    try {
      const config = await this.findOne({ where: { key } });
      if (!config) {
        throw new Error(`Configuration ${key} not found`);
      }

      if (!config.is_editable) {
        throw new Error(`Configuration ${key} is not editable`);
      }

      // Validate value based on validation rules
      if (config.validation_rules) {
        const rules = typeof config.validation_rules === 'string' 
          ? JSON.parse(config.validation_rules) 
          : config.validation_rules;

        if (config.type === 'NUMBER') {
          const numValue = parseFloat(value);
          if (rules.min !== undefined && numValue < rules.min) {
            throw new Error(`Value must be at least ${rules.min}`);
          }
          if (rules.max !== undefined && numValue > rules.max) {
            throw new Error(`Value must be at most ${rules.max}`);
          }
        }
      }

      // Update configuration
      await config.update({
        value: typeof value === 'object' ? JSON.stringify(value) : value.toString(),
        updated_by: userId
      });

      return config;
    } catch (error) {
      console.error(`Error setting config ${key}:`, error);
      throw error;
    }
  };

  return SystemConfig;
};
