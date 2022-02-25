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
  await db.runSql("INSERT INTO payment (id, order_id, type, debtor, status, created_at, updated_at) VALUES" +
      "('9463e3f1-e1c9-4e85-b4ec-49ab48e5d11e', '00001', 'cash', 'endBuyer', 'pending', '2021-06-23 18:30:17', '2021-06-23 18:30:17')," +
      "('9463e3f1-e2c9-4e85-b4ec-49ab48e5d11e', '00002', 'transfer', 'lbc', 'pending', '2021-06-23 19:30:17', '2021-06-23 19:30:17')," +
      "('9463e3f1-e3c9-4e85-b4ec-49ab48e5d11e', '00003', 'transfer', 'lbc', 'pending', '2021-06-23 20:30:17', '2021-06-23 20:30:17');"
  )
}

exports.down = async function (db) {
  return null
}

exports._meta = {
  "version": 1
};
