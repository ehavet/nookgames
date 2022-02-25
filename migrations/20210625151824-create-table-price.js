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
  await db.createTable('price', {
    id: { type: 'string', primaryKey: true, unique: true, notNull: true },
    item_id: {
      type: 'string',
      notNull: true,
      foreignKey: {
        name: 'price_item_id_fk',
        table: 'item',
        rules: {
          onDelete: 'RESTRICT',
          onUpdate: 'RESTRICT'
        },
        mapping: 'id'
      },
    },
    amount: { type: 'int', notNull: true },
    created_at: { type: 'timestamp', notNull: true },
    updated_at: { type: 'timestamp', notNull: true }
  })
}

exports.down = async function(db) {
  await db.dropTable('price')
}

exports._meta = {
  "version": 1
};
