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
  await db.runSql('INSERT INTO "order" (id, client_id, status, sales_channel, created_at, updated_at) VALUES' +
      "('00001', 'ab75a407-e1c9-4e85-b4ec-49ab48e5d11e', 'initialized', 'leboncoin', '2021-06-23 16:30:17', '2021-06-23 16:30:17')," +
      "('00002', 'bb75a407-e1c9-4e85-b4ec-49ab48e5d11e', 'initialized', 'website', '2021-06-23 17:30:17', '2021-06-23 17:30:17')," +
      "('00003', 'cb75a407-e1c9-4e85-b4ec-49ab48e5d11e', 'initialized', 'leboncoin', '2021-06-23 18:30:17', '2021-06-23 18:30:17')"
  )
}

exports.down = async function (db) {
  return null
}

exports._meta = {
  "version": 1
};
