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
  await db.createTable('order', {
    id: { type: 'string', primaryKey: true, unique: true, notNull: true },
    client_id: {
      type: 'string',
      notNull: false,
      foreignKey: {
        name: 'order_client_id_fk',
        table: 'client',
        rules: {
          onDelete: 'SET NULL',
          onUpdate: 'RESTRICT'
        },
        mapping: 'id'
      },
    },
    status: { type: 'string', notNull: true },
    sales_channel: { type: 'string', notNull: true },
    created_at: { type: 'timestamp', notNull: true },
    updated_at: { type: 'timestamp', notNull: true }
  })
}

exports.down = async function(db) {
  await db.dropTable('order')
}

exports._meta = {
  "version": 1
}
