import dayjs from '../../../libs/daysjs'
import {v4 as uuidv4} from 'uuid'

export class WithdrawalRepository {
    #database

    constructor(database) {
        this.#database = database
    }

    async create(withdrawal) {
        const currentDate = dayjs(new Date()).utc().format()
        const persistableValuesObject = {
            id: uuidv4(),
            lot_id: withdrawal.lotId,
            order_id: withdrawal.orderId,
            created_at: currentDate,
            updated_at: currentDate
        }

        try {
            return await this.#database.tx(
                async transaction => {
                    const insertResponse = await transaction.one(
                        'INSERT INTO withdrawal(id, lot_id, order_id, created_at, updated_at)' +
                        'VALUES(${id}, ${lot_id}, ${order_id}, ${created_at}, ${updated_at})' +
                        'RETURNING id, lot_id, order_id, created_at, updated_at',
                        persistableValuesObject
                    )
                    return {
                        id: insertResponse.id,
                        lotId: insertResponse.lot_id,
                        orderId: insertResponse.order_id,
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
            const selectQueryResult = await this.#database.oneOrNone(
                'SELECT withdrawal.id, withdrawal.lot_id, withdrawal.order_id, withdrawal.created_at, withdrawal.updated_at FROM withdrawal WHERE withdrawal.id = $1',
                id
            )
            if (selectQueryResult) {
                return {
                    id: selectQueryResult.id,
                    lotId: selectQueryResult.lot_id,
                    orderId: selectQueryResult.order_id,
                    createdAt: selectQueryResult.created_at,
                    updatedAt: selectQueryResult.updated_at,
                }
            }
        }
    }

    async getAll() {
        const result = await this.#database.manyOrNone(
            'SELECT withdrawal.id, withdrawal.lot_id, withdrawal.order_id, withdrawal.created_at, withdrawal.updated_at FROM withdrawal'
        )
        if (result) {
            return result.map((row) => {
                return {
                    id: row.id,
                    lotId: row.lot_id,
                    orderId: row.order_id,
                    createdAt: row.created_at,
                    updatedAt: row.updated_at,
                }
            })
        }
    }

    async delete(id) {
        try {
            const result = await this.#database.one(
                'DELETE FROM withdrawal WHERE id = $1 RETURNING *',
                id
            )
            console.log(`delete success : ${result} row(s)`)
            return result
        } catch (error) {
            console.log(err)
        }
    }
}