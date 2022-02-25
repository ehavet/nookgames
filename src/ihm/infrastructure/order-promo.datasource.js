export class OrderPromoDatasource {
    #database

    constructor(database) {
        this.#database = database
    }

    async getAll() {
        const result = await this.#database.manyOrNone(
            'SELECT * FROM order_promo'
        )

        if (!result) return console.log('no items')

        return result.map(orderPromo => {
            return {
                orderId: orderPromo.order_id,
                promoId: orderPromo.promo_id,
                createdAt: orderPromo.created_at,
                updatedAt: orderPromo.created_at,
            }
        })
    }
}