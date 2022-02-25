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
    await db.runSql("INSERT INTO item (id, title, pegi, release_date, editor, platform, created_at, updated_at) VALUES" +
        "('mk8dg4m3', 'Mario Kart 8 Deluxe', 3, '2017-01-01', 'nintendo', 'Nintendo Switch', '2021-05-18 15:30:17', '2021-05-18 15:30:17')," +
        "('smo1g4m3', 'Super Mario Odyssey', 7, '2017-01-01', 'nintendo', 'Nintendo Switch', '2021-05-18 15:30:17', '2021-05-18 15:30:17')," +
        "('sm3wbfm3', 'Super Mario 3d World Bowsers fury', 3, '2021-01-01', 'nintendo', 'Nintendo Switch', '2021-05-18 15:30:17', '2021-05-18 15:30:17')," +
        "('smbud4m3', 'Super Mario Bros U Deluxe', 3, '2019-01-01', 'nintendo', 'Nintendo Switch', '2021-05-18 15:30:17', '2021-05-18 15:30:17')," +
        "('botwg4m3', 'The legend of Zelda Breath of the Wild', 12, '2017-01-01', 'nintendo', 'Nintendo Switch', '2021-05-18 15:30:17', '2021-05-18 15:30:17')"
    )
}

exports.down = async function (db) {
    return null
}

exports._meta = {
    "version": 1
};
