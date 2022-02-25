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
  await db.runSql("INSERT INTO price (id, item_id, amount, created_at, updated_at) VALUES" +
      "('eb75a407-e1c9-5e86-b4ec-49ab48e5d11f', 'mk8dg4m3', 3490, '2021-05-13 20:31:17', '2021-05-13 20:31:17')," +
      "('eb75a407-e1c9-5e87-b4ec-49ab48e5d11f', 'smo1g4m3', 3090, '2021-05-13 21:32:18', '2021-05-13 21:32:18')," +
      "('eb75a407-e1c9-5e88-b4ec-49ab48e5d11f', 'sm3wbfm3', 2590, '2021-05-13 22:33:19', '2021-05-13 22:33:19')," +
      "('eb75a407-e1c9-5e89-b4ec-49ab48e5d11f', 'smbud4m3', 3690, '2021-05-13 23:34:20', '2021-05-13 23:34:20')," +
      "('eb75a407-e1c9-5e90-b4ec-49ab48e5d11f', 'botwg4m3', 2090, '2021-05-13 23:35:21', '2021-05-13 23:35:21');"
  )
}

exports.down = async function (db) {
  return null
}

exports._meta = {
  "version": 1
};
