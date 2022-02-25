import dayjs from '../../../libs/daysjs'
import {v4 as uuidv4} from 'uuid'

export class LotRepository {
    #database

    constructor(database) {
        this.#database = database
    }

    async create(lot) {
        const currentDate = dayjs(new Date()).utc().format()
        const persistableValuesObject = {
            id: `${lot.itemId}-${uuidv4().split('-')[1]}`,
            item_id: lot.itemId,
            unit_price: lot.unitPrice,
            quantity: lot.quantity,
            created_at: currentDate,
            updated_at: currentDate
        }

        try {
            return await this.#database.tx(
                async transaction => {
                    const insertResponse = await transaction.one(
                        'INSERT INTO lot(id, item_id, unit_price, quantity, created_at, updated_at)' +
                        'VALUES(${id}, ${item_id}, ${unit_price}, ${quantity}, ${created_at}, ${updated_at})' +
                        'RETURNING id, item_id, unit_price, quantity, created_at, updated_at',
                        persistableValuesObject
                    )
                    return {
                        id: insertResponse.id,
                        itemId: insertResponse.item_id,
                        unitPrice: insertResponse.unit_price,
                        quantity: insertResponse.quantity,
                        createdAt: insertResponse.created_at,
                        updatedAt: insertResponse.updated_at
                    }
                })
        } catch (error) {
            console.log(error)
        }
    }

    async get(id) {
        if (id) {
            const result = await this.#database.oneOrNone(
                'SELECT lot.id, lot.item_id, lot.unit_price, lot.quantity, lot.created_at, lot.updated_at FROM lot WHERE lot.id = $1',
                id
            )
            if (result) {
                return {
                    id: result.id,
                    itemId: result.item_id,
                    unitPrice: result.unit_price,
                    quantity: result.quantity,
                    createdAt: result.created_at,
                    updatedAt: result.updated_at,
                }
            }
        }
    }

    async getAll() {
        const result = await this.#database.manyOrNone(
            'SELECT lot.id, lot.item_id, lot.unit_price, lot.quantity, lot.created_at, lot.updated_at FROM lot'
        )
        if (result) {
            return result.map((row) => {
                return {
                    id: row.id,
                    itemId: row.item_id,
                    unitPrice: row.unit_price,
                    quantity: row.quantity,
                    createdAt: row.created_at,
                    updatedAt: row.updated_at,
                }
            })
        }
    }

    async getAllByItemList(itemList) {
        const result = await this.#database.manyOrNone(
            'SELECT lot.id, lot.item_id, lot.unit_price, lot.quantity, lot.created_at, lot.updated_at FROM lot WHERE lot.item_id IN ($1:csv)',
            [itemList]
        )
        if (result) {
            return result.map((row) => {
                return {
                    id: row.id,
                    itemId: row.item_id,
                    unitPrice: row.unit_price,
                    quantity: row.quantity,
                    createdAt: row.created_at,
                    updatedAt: row.updated_at,
                }
            })
        }
    }

    async delete(id) {
        try {
            const result = await this.#database.one(
                'DELETE FROM lot WHERE id = $1 RETURNING *',
                id
            )
            console.log(`delete success : ${result} row(s)`)
            return result
        } catch (error) {
            console.log(err)
        }
    }

    async update(lot) {
        const currentDate = dayjs(new Date()).utc().format()
        try {
            const updatedSqlLot = await this.#database.tx(
                async transaction => {
                    return await transaction.one(
                        'UPDATE lot SET unit_price = $2, quantity = $3, updated_at = $4 WHERE lot.id = $1 RETURNING *',
                        [
                            lot.id,
                            lot.unitPrice,
                            lot.quantity,
                            currentDate
                        ]
                    )
                })
            return {
                id: updatedSqlLot.id,
                itemId: updatedSqlLot.item_id,
                unitPrice: updatedSqlLot.unit_price,
                quantity: updatedSqlLot.quantity,
                createdAt: updatedSqlLot.created_at,
                updatedAt: updatedSqlLot.updated_at,
            }
        } catch (error) {
            console.log(error)
        }
    }
}