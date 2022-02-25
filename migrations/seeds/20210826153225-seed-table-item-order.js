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
  await db.runSql('INSERT INTO "item_order" (id, item_id, order_id, created_at, updated_at) VALUES' +
      "('ab75a407-e1c9-4e85-a1ec-49ab48e5d17e', 'sm3wbfm3', '00001', '2021-06-23 16:30:17', '2021-06-23 16:30:17')," +
      "('bb75a407-e1c9-4e85-a2ec-49ab48e5d17e', 'botwg4m3', '00002', '2021-06-23 17:30:17', '2021-06-23 17:30:17')," +
      "('bb75a407-e1c9-4e85-a4ec-49ab48e5d17e', 'mk8dg4m3', '00002', '2021-06-23 17:30:17', '2021-06-23 17:30:17')," +
      "('bb75a407-e1c9-4e85-a3ec-49ab48e5d17e', 'botwg4m3', '00003', '2021-06-23 17:30:17', '2021-06-23 17:30:17')," +
      "('eb75a407-e1c9-4e85-a5ec-49ab48e5d17e', 'sm3wbfm3', '00003', '2021-06-23 18:30:17', '2021-06-23 18:30:17')"
  )
}

exports.down = async function (db) {
  return null
}

exports._meta = {
  "version": 1
};
