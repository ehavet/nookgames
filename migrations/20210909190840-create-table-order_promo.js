'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function(db) {
  await db.createTable('order_promo', {
    id: { type: 'string', primaryKey: true, unique: true, notNull: true },
    order_id: {
      type: 'string',
      notNull: true,
      foreignKey: {
        name: 'order_promo_order_id_fk',
        table: 'order',
        rules: {
          onDelete: 'RESTRICT',
          onUpdate: 'RESTRICT'
        },
        mapping: 'id'
      },
    },
    promo_id: {
      type: 'string',
      notNull: true,
      foreignKey: {
        name: 'order_promo_promo_id_fk',
        table: 'promo',
        rules: {
          onDelete: 'RESTRICT',
          onUpdate: 'RESTRICT'
        },
        mapping: 'id'
      },
    },
    created_at: { type: 'timestamp', notNull: true },
    updated_at: { type: 'timestamp', notNull: true }
  })
}

exports.down = async function(db) {
  await db.dropTable('order_promo')
}

exports._meta = {
  "version": 1
};
