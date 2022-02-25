import dayjs from '../../../libs/daysjs'
import {v4 as uuidv4} from 'uuid'

export class ClientRepository {
    #database

    constructor(database) {
        this.#database = database
    }

    async create(client) {
        let result
        const date = new Date()
        const currentDate = dayjs(date).utc().format()
        const persistableValuesObject = {
            id: client.id || client.name.substring(0,2) + date.getFullYear().toString().substring(2,4) + date.toLocaleString('default', { month: 'short' }).substring(0, 2) + uuidv4().split('-')[1],
            name: client.name,
            email: client.email,
            phone_number: client.phoneNumber,
            acquisition_channel: client.acquisitionChannel,
            created_at: currentDate,
            updated_at: currentDate
        }

        await this.#database.tx(
            async transaction => {
                const clientInsert = await transaction.one(
                    'INSERT INTO client(id, name, email, phone_number, acquisition_channel, created_at, updated_at)' +
                    'VALUES(${id}, ${name}, ${email}, ${phone_number}, ${acquisition_channel}, ${created_at}, ${updated_at})' +
                    'RETURNING *',
                    persistableValuesObject
                )
                const addressInsert = await transaction.one(
                    'INSERT INTO address(id, client_id, street, city, postal_code, created_at, updated_at)' +
                    'VALUES(${id}, ${client_id}, ${street}, ${city}, ${postal_code}, ${created_at}, ${updated_at})' +
                    'RETURNING *',
                    {
                        id: uuidv4(),
                        client_id: persistableValuesObject.id,
                        street: client.address.street,
                        city: client.address.city,
                        postal_code: client.address.postalCode,
                        created_at: currentDate,
                        updated_at: currentDate
                    }
                )
                return transaction.batch([clientInsert, addressInsert])
            }).then(data => {
                console.log('insert success')
                result = {
                    id: data[0].id,
                    name: data[0].name,
                    email: data[0].email,
                    phoneNumber: data[0].phone_number,
                    acquisitionChannel: data[0].acquisition_channel,
                    address: {
                        street: data[1].street,
                        city: data[1].city,
                        postalCode: data[1].postal_code
                    }
                }
        }).catch(function (err) {
            console.log(err)
        })
        return result
    }

    async get(clientId) {
        if (clientId) {
            const result = await this.#database.result(
                'SELECT client.id, client.name, client.email, client.phone_number, client.acquisition_channel, address.street, address.city, address.postal_code FROM client, address WHERE client.id = $1 AND address.client_id = $1',
                clientId
            )
            return {
                id: result.rows[0].id,
                name: result.rows[0].name,
                email: result.rows[0].email,
                phoneNumber: result.rows[0].phone_number,
                acquisitionChannel: result.rows[0].acquisition_channel,
                address: {
                    street: result.rows[0].street,
                    city: result.rows[0].city,
                    postalCode: result.rows[0].postal_code
                }
            }
        }
    }

    async update(client) {
        const currentDate = dayjs(new Date()).utc().format()
        const persistableValuesObject = {
            id: client.id,
            name: client.name,
            email: client.email,
            phone_number: client.phoneNumber,
            acquisition_channel: client.acquisitionChannel,
            street: client.address.street,
            city: client.address.city,
            postal_code: client.address.postalCode,
            updated_at: currentDate
        }

        await this.#database.tx(
            async transaction => {
                const clientUpdate = await transaction.none(
                    'UPDATE client SET name = ${name}, email = ${email}, phone_number = ${phone_number}, acquisition_channel = ${acquisition_channel}, updated_at = ${updated_at} WHERE client.id = ${id}',
                    persistableValuesObject
                )
                const addressUpdate = await transaction.none(
                    'UPDATE address SET street = ${street}, city = ${city}, postal_code = ${postal_code}, updated_at = ${updated_at} WHERE address.client_id = ${id}',
                    persistableValuesObject
                )
                return transaction.batch([clientUpdate, addressUpdate])
            }).then(function () {
            console.log('insert success')
        }).catch(function (err) {
            console.log(err)
        })
    }

    async delete(clientId) {
        await this.#database.tx(
            async transaction => {
                const addressDelete = await transaction.one('DELETE FROM address WHERE client_id = $1 RETURNING *', clientId)
                const clientDelete = await transaction.one('DELETE FROM client WHERE id = $1 RETURNING *', clientId)
                return transaction.batch([addressDelete, clientDelete])
            }).then(function () {
            console.log(`delete success : ${result} row(s)`)
        }).catch(function (err) {
            console.log(err)
        })
    }
}