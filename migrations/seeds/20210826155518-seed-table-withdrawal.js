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
    await db.runSql("INSERT INTO withdrawal (id, lot_id, order_id, created_at, updated_at) VALUES" +
        "('3376a401-e1c9-4e86-b4ec-49ab48e5d13f', 'sm3wbfm3-e1c9', '00001', '2021-06-23 16:30:17', '2021-06-23 16:30:17')," +
        "('3376a402-e1c9-4e86-b4ec-49ab48e5d13f', 'botwg4m3-e1c9', '00002', '2021-06-23 16:30:17', '2021-06-23 16:30:17')," +
        "('3377b403-e1c9-4e86-b4ec-49ab48e5d13f', 'botwg4m3-e1c9', '00003', '2021-06-23 17:30:17', '2021-06-23 17:30:17')," +
        "('3377b404-e1c9-4e86-b4ec-49ab48e5d13f', 'mk8dg4m3-e1c9', '00002', '2021-06-23 17:30:17', '2021-06-23 17:30:17')," +
        "('3378c405-e1c9-4e86-b4ec-49ab48e5d13f', 'sm3wbfm3-e1c9', '00003', '2021-06-23 18:30:17', '2021-06-23 18:30:17');"
    )
}

exports.down = async function (db) {
    return null
}

exports._meta = {
    "version": 1
};
