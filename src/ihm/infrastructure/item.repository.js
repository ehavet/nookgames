import dayjs from '../../../libs/daysjs'
import {v4 as uuidv4} from 'uuid'

export class ItemRepository {
    #database
    #items = [
        {id: 'mk8dg4m3', title: 'Mario Kart 8 Deluxe', pegi: 3, release_year: 2017, editor: 'nintendo', platform: 'Nintendo Switch', price: '34.90', cover_img_path: 'mario_kart_8_deluxe_square.jpeg'},
        {id: 'smo1g4m3', title: 'Super Mario Odyssey', pegi: 7, release_year: 2017, editor: 'nintendo', platform: 'Nintendo Switch', price: '34.90', cover_img_path: 'super_mario_odyssey_square.jpeg'},
        {id: 'sm3wbfm3', title: 'Super Mario 3d World Bowser\'s fury', pegi: 3, release_year: 2021, editor: 'nintendo', platform: 'Nintendo Switch', price: '34.90', cover_img_path: 'super_mario_3d_world_bowser_fury_square.jpeg'},
        {id: 'smbud4m3', title: 'Super Mario Bros U Deluxe', pegi: 3, release_year: 2019, editor: 'nintendo', platform: 'Nintendo Switch', price: '34.90', cover_img_path: 'mario_bros_u_deluxe_square.jpeg'},
        {id: 'botwg4m3', title: 'The legend of Zelda Breath of the Wild', pegi: 12, release_year: 2017, editor: 'nintendo', platform: 'Nintendo Switch', price: '34.90', cover_img_path: 'zelda_breath_of_the_wild_cover.jpeg'}
    ]

    constructor(database) {
        this.#database = database
    }

    async create(item) {
        const currentDate = dayjs(new Date()).utc().format()
        const persistableValuesObject = {
            id: item.id,
            title: item.title,
            pegi: item.pegi,
            release_date: item.releaseDate.format(),
            editor: item.editor,
            platform: item.platform,
            price: item.price,
            created_at: currentDate,
            updated_at: currentDate
        }

        await this.#database.tx(
            async transaction => {
                const itemInsert = await transaction.none(
                    'INSERT INTO item(id, title, pegi, release_date, editor, platform, created_at, updated_at)' +
                    'VALUES(${id}, ${title}, ${pegi}, ${release_date}, ${editor}, ${platform}, ${created_at}, ${updated_at})',
                    persistableValuesObject
                )
                const priceInsert = await transaction.none(
                    'INSERT INTO price(id, item_id, amount, created_at, updated_at)' +
                    'VALUES(${id}, ${item_id}, ${amount}, ${created_at}, ${updated_at})',
                    {
                        id: uuidv4(),
                        item_id: persistableValuesObject.id,
                        amount: persistableValuesObject.price,
                        created_at: persistableValuesObject.created_at,
                        updated_at: persistableValuesObject.updated_at
                    }
                )
                return transaction.batch([itemInsert, priceInsert])
            }).then(function () {
            console.log('insert success')
        }).catch(function (err) {
            console.log(err)
        })
    }

    async get(itemId) {
        const result = await this.#database.oneOrNone(
            'SELECT item.id, item.title, item.pegi, item.created_at, item.updated_at, item.release_date, item.editor, item.platform, price.amount FROM item INNER JOIN (SELECT price.item_id, max(price.created_at) created_at FROM price GROUP BY price.item_id) lastPrice ON lastPrice.item_id = item.id LEFT JOIN price ON price.item_id = lastPrice.item_id AND price.created_at = lastPrice.created_at WHERE item.id = $1',
            itemId
        )

        if (!result) return console.log('no items')

        return {
            id: result.id,
            title: result.title,
            pegi: result.pegi,
            createdAt: result.created_at,
            updatedAt: result.updated_at,
            releaseDate: result.release_date,
            editor: result.editor,
            platform: result.platform,
            price: result.amount
        }
    }

    async getAll() {
        const result = await this.#database.manyOrNone(
            'SELECT item.id, item.title, item.pegi, item.created_at, item.updated_at, item.release_date, item.editor, item.platform, price.amount FROM item INNER JOIN (SELECT price.item_id, max(price.created_at) created_at FROM price GROUP BY price.item_id) lastPrice ON lastPrice.item_id = item.id LEFT JOIN price ON price.item_id = lastPrice.item_id AND price.created_at = lastPrice.created_at',
        )

        if (!result) return console.log('no items')

        return result.map((row) => {
            return {
                id: row.id,
                title: row.title,
                pegi: row.pegi,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                releaseDate: row.release_date,
                editor: row.editor,
                platform: row.platform,
                price: row.amount
            }
        })
    }

    async getList(itemIds) {
        const result = await this.#database.manyOrNone(
            'SELECT item.id, item.title, item.pegi, item.created_at, item.updated_at, item.release_date, item.editor, item.platform, price.amount FROM item INNER JOIN (SELECT price.item_id, max(price.created_at) created_at FROM price GROUP BY price.item_id) lastPrice ON lastPrice.item_id = item.id LEFT JOIN price ON price.item_id = lastPrice.item_id AND price.created_at = lastPrice.created_at WHERE item.id IN ($1:csv)',
            [itemIds]
        )

        if (!result) return console.log('no items')

        return result.map((row) => {
            return {
                id: row.id,
                title: row.title,
                pegi: row.pegi,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                releaseDate: row.release_date,
                editor: row.editor,
                platform: row.platform,
                price: row.amount
            }
        })
    }

    async update(item) {
        const currentDate = dayjs(new Date()).utc().format()
        const persistableValuesObject = {
            id: item.id,
            amount: item.price,
            updated_at: currentDate
        }

        await this.#database.tx(
            async transaction => {
                const itemUpdate = await transaction.none('UPDATE item SET updated_at = ${updated_at} WHERE item.id = ${id}', persistableValuesObject)
                const priceUpdate = await transaction.none(
                    'INSERT INTO price(id, item_id, amount, created_at, updated_at)' +
                    'VALUES(${id}, ${item_id}, ${amount}, ${created_at}, ${updated_at})',
                    {
                        id: uuidv4(),
                        item_id: persistableValuesObject.id,
                        amount: persistableValuesObject.amount,
                        created_at: persistableValuesObject.updated_at,
                        updated_at: persistableValuesObject.updated_at
                    }
                )
                return transaction.batch([itemUpdate, priceUpdate])
            }).then(function () {
            console.log('insert price success')
        }).catch(function (err) {
            console.log(err)
        })
    }

    async delete(itemId) {
        const result = await this.#database.one('DELETE FROM item WHERE id = $1 RETURNING *', itemId)
            .then(function () {
                console.log(`delete success : ${result} row(s)`)
            }).catch(function (err) {
                console.log(err)
            })
        return result
    }
}