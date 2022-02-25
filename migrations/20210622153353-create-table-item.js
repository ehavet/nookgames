'use strict';

let dbm
let type
let seed

exports.setup = function (options, seedLink) {
    dbm = options.dbmigrate
    type = dbm.dataType
    seed = seedLink
};

exports.up = async function (db) {
    await db.createTable('item', {
        id: { type: 'string', primaryKey: true, unique: true, notNull: true },
        title: { type: 'string', notNull: true },
        pegi: { type: 'smallint', notNull: true },
        release_date: { type: 'date', notNull: true },
        editor: { type: 'string', notNull: true },
        platform: { type: 'string', notNull: true },
        created_at: { type: 'timestamp', notNull: true },
        updated_at: { type: 'timestamp', notNull: true }
    })
}

exports.down = async function (db) {
    await db.dropTable('item')
}

exports._meta = {
    "version": 1
}
