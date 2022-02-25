export class PromoRepository {
    #database

    constructor(database) {
        this.#database = database
    }

    async getAll() {
        const result = await this.#database.manyOrNone(
            'SELECT * FROM promo'
        )

        if (!result) return console.log('no items')

        return result.map(promo => {
            return {
                id: promo.id,
                type: promo.type,
                value: promo.value
            }
        })
    }
}