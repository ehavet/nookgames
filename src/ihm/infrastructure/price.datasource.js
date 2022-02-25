export class PriceDatasource {
    #database

    constructor(database) {
        this.#database = database
    }

    async getAll() {
        const result = await this.#database.manyOrNone(
            'SELECT * FROM price'
        )

        if (!result) return console.log('no items')

        return result.map(price => {
            return {
                itemId: price.item_id,
                amount: price.amount,
                createdAt: price.created_at,
            }
        })
    }

    async getAllPricesByItemId(itemId) {
        const result = await this.#database.manyOrNone(
            'SELECT * FROM price WHERE price.item_id = $1',
            itemId
        )

        if (!result) return console.log('no items')

        return result.map(price => {
            return {
                itemId: price.item_id,
                amount: price.amount,
                createdAt: price.created_at,
            }
        })
    }
}