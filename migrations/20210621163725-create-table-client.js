'use strict';

let dbm;
let type;
let seed;

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
    await db.createTable('client', {
        id: { type: 'string', primaryKey: true, unique: true, notNull: true },
        name: { type: 'string', notNull: true },
        email: 'string',
        phone_number: 'string',
        acquisition_channel: { type: 'string', notNull: true },
        created_at: { type: 'timestamp', notNull: true },
        updated_at: { type: 'timestamp', notNull: true }
    })
};

exports.down = async function (db) {
    await db.dropTable('client')
};

exports._meta = {
    "version": 1
};