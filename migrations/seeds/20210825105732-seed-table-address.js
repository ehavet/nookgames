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
    await db.runSql("INSERT INTO address (id, street, city, postal_code, client_id, created_at, updated_at) VALUES" +
        "('ab75a407-e1c9-4e85-b4ec-49ab48e5d12e', '69 rue du paradis', 'Paris', '75001', 'ab75a407-e1c9-4e85-b4ec-49ab48e5d11e', '2021-06-23 16:30:17', '2021-06-23 16:30:17')," +
        "('bb75a407-e1c9-4e85-b4ec-49ab48e5d12e', '9 rue des artilleurs', 'Paris', '75012', 'bb75a407-e1c9-4e85-b4ec-49ab48e5d11e', '2021-06-23 17:30:17', '2021-06-23 17:30:17')," +
        "('bb77a407-e1c9-4e85-b4ec-49ab48e5d12e', '37 rue des poivrots', 'Paris', '75012', 'cb75a407-e1c9-4e85-b4ec-49ab48e5d11e', '2021-06-23 17:30:17', '2021-06-23 17:30:17')," +
        "('bb78a407-e1c9-4e85-b4ec-49ab48e5d12e', '76 rue rigolo', 'Paris', '75012', 'db75a407-e1c9-4e85-b4ec-49ab48e5d11e', '2021-06-23 17:30:17', '2021-06-23 17:30:17')," +
        "('eb75a407-e1c9-4e85-b4ec-49ab48e5d12e', '44 rue des blaireaux', 'Paris', '75020', 'eb75a407-e1c9-4e85-b4ec-49ab48e5d11e', '2021-06-23 18:30:17', '2021-06-23 18:30:17')"
    )
}

exports.down = async function (db) {
    return null
}

exports._meta = {
    "version": 1
};
