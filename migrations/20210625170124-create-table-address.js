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

exports.up = async function (db) {
  await db.createTable('address', {
    id: { type: 'string', primaryKey: true, unique: true, notNull: true },
    street: { type: 'text', notNull: true },
    city: { type: 'string', notNull: true },
    postal_code: { type: 'string', notNull: true },
    client_id: {
      type: 'string',
      notNull: true,
      foreignKey: {
        name: 'address_client_id_fk',
        table: 'client',
        rules: {
          onDelete: 'CASCADE',
          onUpdate: 'RESTRICT'
        },
        mapping: 'id'
      },
    },
    created_at: { type: 'timestamp', notNull: true },
    updated_at: { type: 'timestamp', notNull: true }
  })
};

exports.down = async function (db) {
  await db.dropTable('address')
};

exports._meta = {
  "version": 1
};
