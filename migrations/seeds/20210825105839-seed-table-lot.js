'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
    dbm = options.dbmigrate;
    type = dbm.dataType;
    seed = seedLink;
};

exports.up = async function (db) {
    await db.runSql("INSERT INTO lot (id, item_id, unit_price, quantity, created_at, updated_at) VALUES" +
        "('mk8dg4m3-e1c9', 'mk8dg4m3', 1300, 99, '2021-04-23 10:30:17', '2021-04-23 10:30:17')," +
        "('botwg4m3-e1c9', 'botwg4m3', 1533, 150, '2021-05-23 10:25:17', '2021-05-23 10:25:17')," +
        "('smbud4m3-e1c9', 'smbud4m3', 1533, 150, '2021-05-23 10:25:17', '2021-05-23 10:25:17')," +
        "('smo1g4m3-e1c9', 'smo1g4m3', 1533, 150, '2021-05-23 10:25:17', '2021-05-23 10:25:17')," +
        "('sm3wbfm3-e1c9', 'sm3wbfm3', 1455, 55, '2021-03-21 19:47:18', '2021-03-21 19:47:18')"
    )
}

exports.down = async function (db) {
    return null
}

exports._meta = {
    "version": 1
};
