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
    await db.runSql("INSERT INTO client (id, name, email, phone_number, acquisition_channel, created_at, updated_at) VALUES" +
        "('ab75a407-e1c9-4e85-b4ec-49ab48e5d11e', 'jean jean', 'jeanjean@gmail.com', '0623746305', 'leboncoin', '2021-06-23 16:30:17', '2021-06-23 16:30:17')," +
        "('bb75a407-e1c9-4e85-b4ec-49ab48e5d11e', 'mario bros', 'mario@gmail.com', '0623746306', 'leboncoin', '2021-06-23 17:30:17', '2021-06-23 17:30:17')," +
        "('cb75a407-e1c9-4e85-b4ec-49ab48e5d11e', 'donkey kong', 'donkey@gmail.com', '0623746307', 'vinted', '2021-06-23 18:30:17', '2021-06-23 18:30:17')," +
        "('db75a407-e1c9-4e85-b4ec-49ab48e5d11e', 'bernard le trimard', 'bernardletrimard@gmail.com', '0623746308', 'vinted', '2021-06-23 19:30:17', '2021-06-23 19:30:17')," +
        "('eb75a407-e1c9-4e85-b4ec-49ab48e5d11e', 'lulu la berlue', 'lulu@gmail.com', '0623746309', 'website', '2021-06-23 20:30:17', '2021-06-23 20:30:17');"
    )
}

exports.down = async function (db) {
    await db.runSql('TRUNCATE TABLE withdrawal, payment, delivery, item_order, order_promo, promo, "order", price, lot, item, address, client')
}

exports._meta = {
    "version": 1
};
