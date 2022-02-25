import pgPromise from 'pg-promise'
import pkg from 'bluebird'
const {Promise} = pkg
import dayjs from '../libs/daysjs'

const pgp = pgPromise({
    promiseLib: Promise,
    capSQL: true,
    connect(client, dc, useCount) {
        const cp = client.connectionParameters;
        console.log('Connected to database:', cp.database);
    }
})

// https://github.com/brianc/node-pg-types/blob/master/lib/builtins.js
// 1114 is type id (OID) for TIMESTAMP in Postgres
pgp.pg.types.setTypeParser(1114,str => dayjs.tz(str, 'UTC').toDate())
// 1082 is type id (OID) for DATE in Postgres
pgp.pg.types.setTypeParser(1082,str => str)

const connectionConfig = {
    host: 'localhost',
    port: 54334,
    database: 'test',
    user: 'test',
    password: 'test',
    max: 30
};

export default () => {
    return pgp(connectionConfig)
}