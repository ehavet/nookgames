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
  await db.runSql('INSERT INTO promo (id, type, value, created_at, updated_at) VALUES' +
      "('w3lc0m', 'discount_on_invoice', 1000, '2021-05-23 16:30:17', '2021-05-23 16:30:17')," +
      "('l0vlbc', 'discount_per_item', 0500, '2021-05-23 18:30:17', '2021-05-23 18:30:17')"
  )
}

exports.down = async function (db) {
  return null
}

exports._meta = {
  "version": 1
};
