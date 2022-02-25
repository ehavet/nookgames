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
    await db.runSql("INSERT INTO order_promo (id, order_id, promo_id, created_at, updated_at) VALUES" +
        "('0rd3r01-pr0m0-4e86-b4ec-49ab48e5d13f', '00002', 'w3lc0m', '2021-06-23 16:30:17', '2021-06-23 16:30:17')," +
        "('0rd3r05-pr0m0-4e86-b4ec-49ab48e5d13f', '00003', 'l0vlbc', '2021-06-23 18:30:17', '2021-06-23 18:30:17');"
    )
}

exports.down = async function (db) {
    return null
}

exports._meta = {
    "version": 1
};
