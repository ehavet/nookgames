import dayjs from '../../../libs/daysjs'
import {v4 as uuidv4} from 'uuid'

export class OrderRepository {
    #database

    constructor(database) {
        this.#database = database
    }

    // pas de update dans les repository
    // voir le repo comme une collection
    async save(order) {
        let result
        // ab75a407-e1c9-4e85-b4ec-49ab48e5d11e
        const date = new Date()
        const uuid = uuidv4()
        const idPrefix = uuid.substring(0,2)
        const idSuffix = uuid.substring(4,8)
        const orderId = order.id || idPrefix + date.getFullYear().toString().substring(2,4) + idSuffix + date.toLocaleString('default', { month: 'short' }).substring(0, 2)
        const currentDate = dayjs(date).utc().format()
        const persistableOrderValues = {
            id: orderId,
            client_id: order.clientId,
            status: order.status,
            sales_channel: order.salesChannel,
            created_at: currentDate,
            updated_at: currentDate
        }

        const persistableDeliveryValues = {
            id: uuidv4(),
            order_id: orderId,
            type: order.delivery.type,
            provider: order.delivery.provider,
            tracking_number: order.delivery.trackingNumber,
            status: order.delivery.status,
            created_at: currentDate,
            updated_at: currentDate
        }

        const persistablePaymentValues = {
            id: uuidv4(),
            order_id: orderId,
            debtor: order.payment.debtor,
            type: order.payment.type,
            status: order.payment.status,
            created_at: currentDate,
            updated_at: currentDate
        }

        await this.#database.tx(
            async transaction => {
                const orderInsert = await transaction.one(
                    'INSERT INTO "order"(id, client_id, status, sales_channel, created_at, updated_at)' +
                    'VALUES(${id}, ${client_id}, ${status}, ${sales_channel}, ${created_at}, ${updated_at})' +
                    'RETURNING *',
                    persistableOrderValues
                )
                const deliveryInsert = await transaction.one(
                    'INSERT INTO delivery(id, order_id, type, provider, tracking_number, status, created_at, updated_at)' +
                    'VALUES(${id}, ${order_id}, ${type}, ${provider}, ${tracking_number}, ${status}, ${created_at}, ${updated_at})' +
                    'RETURNING *',
                    persistableDeliveryValues
                )
                const paymentInsert = await transaction.one(
                    'INSERT INTO payment(id, order_id, type, debtor, status, created_at, updated_at)' +
                    'VALUES(${id}, ${order_id}, ${type}, ${debtor}, ${status}, ${created_at}, ${updated_at})' +
                    'RETURNING *',
                    persistablePaymentValues
                )

                const cartIdList = []
                if (order.cart) {
                    for (const id of order.cart) {
                        cartIdList.push(await transaction.one(
                            'INSERT INTO item_order(id, order_id, item_id, created_at, updated_at)' +
                            'VALUES(${id}, ${order_id}, ${item_id}, ${created_at}, ${updated_at})' +
                            'RETURNING *',
                            {
                                id: uuidv4(),
                                order_id: orderId,
                                item_id: id,
                                created_at: currentDate,
                                updated_at: currentDate
                            }
                        ))
                    }
                }

                const orderPromoList = []
                if (order.promoCodes) {
                    for (const id of order.promoCodes) {
                        orderPromoList.push(await transaction.one(
                            'INSERT INTO order_promo(id, order_id, promo_id, created_at, updated_at)' +
                            'VALUES(${id}, ${order_id}, ${promo_id}, ${created_at}, ${updated_at})' +
                            'RETURNING *',
                            {
                                id: uuidv4(),
                                order_id: orderId,
                                promo_id: id,
                                created_at: currentDate,
                                updated_at: currentDate
                            }
                        ))
                    }
                }
                return transaction.batch([orderInsert, deliveryInsert, paymentInsert, cartIdList, orderPromoList])
            }).then(data => {
            result = {
                id: data[0].id,
                clientId: data[0].client_id,
                status: data[0].status,
                salesChannel: data[0].sales_channel,
                cart: data[3].map(itemOrder => itemOrder.item_id),
                promoCodes: data[4].map(promo => promo.promo_id),
                payment: {
                    type: data[2].type,
                    debtor: data[2].debtor,
                    status: data[2].status
                },
                delivery: {
                    type: data[1].type,
                    provider: data[1].provider,
                    trackingNumber: data[1].tracking_number,
                    status: data[1].status
                },
                createdAt: data[0].created_at,
                updatedAt: data[0].updated_at
            }
            console.log('insert success')
        }).catch(function (err) {
            console.log(err)
        })
        return result
    }

    async get(id) {
        if (id) {
            const order = await this.#database.oneOrNone(
                'SELECT $1:raw, cart.item_list, promos.promo_list FROM "order" AS left_table LEFT JOIN payment ON left_table.id = payment.order_id LEFT JOIN delivery ON left_table.id = delivery.order_id LEFT JOIN (SELECT order_id, array_agg(item_id) AS item_list FROM item_order WHERE order_id = $2 GROUP BY order_id) AS cart ON cart.order_id = $2 LEFT JOIN (SELECT order_id, array_agg(promo_id) AS promo_list FROM order_promo WHERE order_id = $2 GROUP BY order_id) AS promos ON promos.order_id = $2 WHERE left_table.id = $2',
                [
                    'left_table.id,' +
                    'left_table.client_id,' +
                    'left_table.status,' +
                    'left_table.sales_channel,' +
                    'left_table.updated_at,' +
                    'left_table.created_at,' +
                    'payment.type AS payment_type,' +
                    'payment.debtor AS payment_debtor,' +
                    'payment.status AS payment_status,' +
                    'delivery.type AS delivery_type,' +
                    'delivery.provider AS delivery_provider,' +
                    'delivery.tracking_number AS delivery_tracking_number,' +
                    'delivery.status AS delivery_status',
                    id
                ]
            )

            return {
                id: order.id,
                clientId: order.client_id,
                status: order.status,
                salesChannel: order.sales_channel,
                cart: order.item_list || [],
                promoCodes: order.promo_list || [],
                payment: {
                    type: order.payment_type,
                    debtor: order.payment_debtor,
                    status: order.payment_status
                },
                delivery: {
                    type: order.delivery_type,
                    provider: order.delivery_provider,
                    trackingNumber: order.delivery_tracking_number,
                    status: order.delivery_status
                },
                createdAt: order.created_at,
                updatedAt: order.updated_at
            }
        }
    }

    async getAll() {
        const result = await this.#database.manyOrNone(
            'SELECT $1:raw, cart.item_list, promos.promo_list FROM "order" AS left_table LEFT JOIN payment ON left_table.id = payment.order_id LEFT JOIN delivery ON left_table.id = delivery.order_id LEFT JOIN (SELECT order_id, array_agg(item_id) AS item_list FROM item_order GROUP BY order_id) AS cart ON cart.order_id = left_table.id LEFT JOIN (SELECT order_id, array_agg(promo_id) AS promo_list FROM order_promo GROUP BY order_id) AS promos ON promos.order_id = left_table.id',
            [
                'left_table.id,' +
                'left_table.client_id,' +
                'left_table.status,' +
                'left_table.sales_channel,' +
                'left_table.updated_at,' +
                'left_table.created_at,' +
                'payment.type AS payment_type,' +
                'payment.debtor AS payment_debtor,' +
                'payment.status AS payment_status,' +
                'delivery.type AS delivery_type,' +
                'delivery.provider AS delivery_provider,' +
                'delivery.tracking_number AS delivery_tracking_number,' +
                'delivery.status AS delivery_status'
            ]
        )
        return result.map((order) => {
            return {
                id: order.id,
                clientId: order.client_id,
                status: order.status,
                salesChannel: order.sales_channel,
                cart: order.item_list || [],
                promoCodes: order.promo_list || [],
                payment: {
                    type: order.payment_type,
                    debtor: order.payment_debtor,
                    status: order.payment_status
                },
                delivery: {
                    type: order.delivery_type,
                    provider: order.delivery_provider,
                    trackingNumber: order.delivery_tracking_number,
                    status: order.delivery_status
                },
                createdAt: order.created_at,
                updatedAt: order.updated_at
            }
        })
    }

    async update(order) {
        const currentDate = dayjs(new Date()).utc().format()
        const persistableOrderValues = {
            status: order.status,
            sales_channel: order.salesChannel,
        }

        const persistableDeliveryValues = {
            type: order.delivery.type,
            provider: order.delivery.provider,
            tracking_number: order.delivery.trackingNumber,
            status: order.delivery.status,
        }

        const persistablePaymentValues = {
            debtor: order.payment.debtor,
            type: order.payment.type,
            status: order.payment.status,
        }

        await this.#database.tx(
            async transaction => {
                const orderUpdate = await transaction.none(
                    'UPDATE "order" SET status = $2, sales_channel = $3, updated_at = $4 WHERE "order".id = $1',
                    [
                        order.id,
                        persistableOrderValues.status,
                        persistableOrderValues.sales_channel,
                        currentDate
                    ]
                )
                const deliveryUpdate = await transaction.none(
                    'UPDATE "delivery" SET type = $2, provider = $3, tracking_number = $4, status = $5, updated_at = $6 WHERE delivery.order_id = $1',
                    [
                        order.id,
                        persistableDeliveryValues.type,
                        persistableDeliveryValues.provider,
                        persistableDeliveryValues.tracking_number,
                        persistableDeliveryValues.status,
                        currentDate
                    ]
                )
                const paymentUpdate = await transaction.none(
                    'UPDATE "payment" SET debtor = $2, type = $3, status = $4, updated_at = $5 WHERE payment.order_id = $1',
                    [
                        order.id,
                        persistablePaymentValues.debtor,
                        persistablePaymentValues.type,
                        persistablePaymentValues.status,
                        currentDate
                    ]
                )


                const cartDelete = await transaction.none(
                    'DELETE FROM item_order WHERE item_order.order_id = $1',
                    order.id
                )

                if (order.cart && order.cart.length > 0) {
                    for (const itemId of order.cart) {
                        await transaction.none(
                            'INSERT INTO item_order(id, order_id, item_id, created_at, updated_at)' +
                            'VALUES(${id}, ${order_id}, ${item_id}, ${created_at}, ${updated_at})',
                            {
                                id: uuidv4(),
                                order_id: order.id,
                                item_id: itemId,
                                created_at: currentDate,
                                updated_at: currentDate
                            }
                        )
                    }
                }

                return transaction.batch([orderUpdate, deliveryUpdate, paymentUpdate, cartDelete])
            }).then(function () {
            console.log('insert success')
        }).catch(function (err) {
            console.log(err)
        })
    }
}