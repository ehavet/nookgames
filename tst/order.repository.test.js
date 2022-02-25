import {expect, database, dateFaker} from './toolbox'
import dayjs from '../libs/daysjs'
import {OrderRepository} from '../src/ihm/infrastructure/order.repository'
import {OrderStatus} from '../src/ihm/domain/order-status'
import {SalesChannel} from '../src/ihm/domain/sales-channel'
import {PaymentType} from '../src/ihm/domain/payment-type'
import {PaymentStatus} from '../src/ihm/domain/payment-status'
import {DeliveryType} from '../src/ihm/domain/delivery-type'
import {DeliveryProvider} from '../src/ihm/domain/delivery-provider'
import {DeliveryStatus} from '../src/ihm/domain/delivery-status'
import {ItemRepository} from '../src/ihm/infrastructure/item.repository'
import {PaymentDebtor} from '../src/ihm/domain/payment-debtor'

describe('OrderRepository', function () {
    let orderRepository
    let itemRepository
    const orderIds = ['ab75a407-e1c9-4e85-b4ec-49ab48e5d11e', 'cd75a407-e1c9-4e85-b4ec-49ab48e5d11e']
    const cart = ['mariol', 'pacpac']
    const promoList = [
        {id: 'promo1', type: 'discount', value: 1000},
        {id: 'promo2', type: 'free', value: 0}
    ]
    const currentDatetime = new Date('2021-06-23 18:30:17.000000')

    const clearDatabase = async () => {
        await database.result(
            'DELETE FROM item_order WHERE order_id IN ($1:csv)', [orderIds], a => a.rowCount
        )
        await database.result(
            'DELETE FROM order_promo WHERE order_id IN ($1:csv)', [orderIds], a => a.rowCount
        )
        await database.result(
            'DELETE FROM price WHERE item_id IN ($1:csv)', [cart], a => a.rowCount
        )
        await database.result(
            'DELETE FROM item WHERE id IN ($1:csv)', [cart], a => a.rowCount
        )
        await database.result(
            'DELETE FROM delivery WHERE order_id IN ($1:csv)', [orderIds], a => a.rowCount
        )
        await database.result(
            'DELETE FROM payment WHERE order_id IN ($1:csv)', [orderIds], a => a.rowCount
        )
        await database.result(
            'DELETE FROM "order" WHERE id IN ($1:csv)', [orderIds], a => a.rowCount
        )
    }

    before(async () => {
        orderRepository = new OrderRepository(database)
        itemRepository = new ItemRepository(database)
        for (const promo of promoList) {
            await database.result(
                'INSERT INTO promo (id, type, value, created_at, updated_at) VALUES (${id}, ${type}, ${value}, ${created_at}, ${updated_at})',
                {...promo, ...{created_at: currentDatetime, updated_at: currentDatetime}}
            )
        }
    })

    beforeEach(async () => {
        dateFaker.setCurrentDate(currentDatetime)
        for (const id of cart) {
            await itemRepository.create({
                id: id,
                title: 'super ' + id + ' 3',
                pegi: 3,
                releaseDate: dayjs('2017-04-27'),
                editor: 'nintendo',
                platform: 'nintendo switch',
                price: 3590
            })
        }
    })

    afterEach(async () => {
        await clearDatabase()
    })

    after(async () => {
        const idList = promoList.map(promo => promo.id)
        await database.result(
            'DELETE FROM promo WHERE id in ($1:csv)', [idList], a => a.rowCount
        )
    })

    describe('#save', function () {
        it('doit enregistrer une commande et son panier en base de donnée', async function () {
            const expectedOrder = {
                id: orderIds[0],
                clientId: null,
                status: OrderStatus.INITIALIZED.toString(),
                salesChannel: SalesChannel.HOME.toString(),
                cart: cart,
                promoCodes: ['promo1'],
                payment: {
                    type: PaymentType.TRANSFER.toString(),
                    debtor: PaymentDebtor.LBC.toString(),
                    status: PaymentStatus.PENDING.toString()
                },
                delivery: {
                    type: DeliveryType.SHIPMENT.toString(),
                    provider: DeliveryProvider.MONDIAL_RELAY.toString(),
                    trackingNumber: '2837328821',
                    status: DeliveryStatus.IN_TRANSIT.toString()
                }
            }

            const result = await orderRepository.save(expectedOrder)

            const orders = await database.result(
                'SELECT $1:raw FROM "order" AS left_table LEFT JOIN payment ON left_table.id = payment.order_id LEFT JOIN delivery ON left_table.id = delivery.order_id WHERE left_table.id = $2',
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
                    orderIds[0]
                ]
            )

            const cartItems = await database.result(
                'SELECT $1:raw FROM "item_order" AS left_table WHERE left_table.order_id = $2',
                [
                    'left_table.item_id,' +
                    'left_table.order_id,' +
                    'left_table.updated_at,' +
                    'left_table.created_at',
                    orderIds[0]
                ]
            )

            expect(orders.rows[0].id).to.equal(orderIds[0])
            expect(orders.rows[0].client_id).to.equal(null)
            expect(orders.rows[0].status).to.equal('initialized')
            expect(orders.rows[0].sales_channel).to.equal('home')
            expect(orders.rows[0].payment_type).to.equal('transfer')
            expect(orders.rows[0].payment_debtor).to.equal('lbc')
            expect(orders.rows[0].payment_status).to.equal('pending')
            expect(orders.rows[0].delivery_type).to.equal('shipment')
            expect(orders.rows[0].delivery_provider).to.equal('mondial_relay')
            expect(orders.rows[0].delivery_tracking_number).to.equal('2837328821')
            expect(orders.rows[0].delivery_status).to.equal('in_transit')
            expect(orders.rows[0].created_at).to.deep.equal(currentDatetime)
            expect(orders.rows[0].updated_at).to.deep.equal(currentDatetime)

            expect(cartItems.rows.length).to.equal(2)
            expect(cartItems.rows.map((obj) => obj.item_id)).to.deep.equal(cart)

            expect(result).to.deep.equal(
                {
                    ...expectedOrder,
                    ...{createdAt: currentDatetime, updatedAt: currentDatetime}
                }
            )
        })

        it('doit enregistrer une commande sans panier en base de donnée', async function () {
            await orderRepository.save({
                id: orderIds[0],
                clientId: null,
                status: OrderStatus.INITIALIZED.toString(),
                salesChannel: SalesChannel.HOME.toString(),
                cart: null,
                promoCodes: [],
                payment: {
                    type: PaymentType.TRANSFER.toString(),
                    debtor: PaymentDebtor.LBC.toString(),
                    status: PaymentStatus.PENDING.toString()
                },
                delivery: {
                    type: DeliveryType.SHIPMENT.toString(),
                    provider: DeliveryProvider.MONDIAL_RELAY.toString(),
                    trackingNumber: '2837328821',
                    status: DeliveryStatus.IN_TRANSIT.toString()
                }
            })

            const orders = await database.result(
                'SELECT $1:raw FROM "order" AS left_table LEFT JOIN payment ON left_table.id = payment.order_id LEFT JOIN delivery ON left_table.id = delivery.order_id WHERE left_table.id = $2',
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
                    orderIds[0]
                ]
            )

            const cartItems = await database.result(
                'SELECT $1:raw FROM "item_order" AS left_table WHERE left_table.order_id = $2',
                [
                    'left_table.item_id,' +
                    'left_table.order_id,' +
                    'left_table.updated_at,' +
                    'left_table.created_at',
                    orderIds[0]
                ]
            )

            expect(orders.rows[0].id).to.equal(orderIds[0])
            expect(orders.rows[0].client_id).to.equal(null)
            expect(orders.rows[0].status).to.equal('initialized')
            expect(orders.rows[0].sales_channel).to.equal('home')
            expect(orders.rows[0].payment_type).to.equal('transfer')
            expect(orders.rows[0].payment_debtor).to.equal('lbc')
            expect(orders.rows[0].payment_status).to.equal('pending')
            expect(orders.rows[0].delivery_type).to.equal('shipment')
            expect(orders.rows[0].delivery_provider).to.equal('mondial_relay')
            expect(orders.rows[0].delivery_tracking_number).to.equal('2837328821')
            expect(orders.rows[0].delivery_status).to.equal('in_transit')
            expect(orders.rows[0].created_at).to.deep.equal(currentDatetime)
            expect(orders.rows[0].updated_at).to.deep.equal(currentDatetime)
            expect(cartItems.rows.length).to.equal(0)
        })
    })

    describe('#get', function () {
        it('doit retourner une commande par son numéro de commande', async () => {
            await orderRepository.save({
                id: orderIds[0],
                clientId: null,
                status: OrderStatus.INITIALIZED.toString(),
                salesChannel: SalesChannel.HOME.toString(),
                cart: cart,
                promoCodes: [],
                payment: {
                    type: PaymentType.TRANSFER.toString(),
                    debtor: PaymentDebtor.LBC.toString(),
                    status: PaymentStatus.PENDING.toString()
                },
                delivery: {
                    type: DeliveryType.SHIPMENT.toString(),
                    provider: DeliveryProvider.MONDIAL_RELAY.toString(),
                    trackingNumber: '2837328821',
                    status: DeliveryStatus.IN_TRANSIT.toString()
                }
            })

            const result = await orderRepository.get(orderIds[0])

            expect(result).to.deep.equal({
                id: orderIds[0],
                clientId: null,
                status: OrderStatus.INITIALIZED.toString(),
                salesChannel: SalesChannel.HOME.toString(),
                cart: cart,
                promoCodes: [],
                payment: {
                    type: PaymentType.TRANSFER.toString(),
                    debtor: PaymentDebtor.LBC.toString(),
                    status: PaymentStatus.PENDING.toString()
                },
                delivery: {
                    type: DeliveryType.SHIPMENT.toString(),
                    provider: DeliveryProvider.MONDIAL_RELAY.toString(),
                    trackingNumber: '2837328821',
                    status: DeliveryStatus.IN_TRANSIT.toString()
                },
                createdAt: currentDatetime,
                updatedAt: currentDatetime
            })
        })

        it('doit retourner une commande sans panier par son numéro de commande', async () => {
            const order = {
                id: orderIds[0],
                clientId: null,
                status: OrderStatus.INITIALIZED.toString(),
                salesChannel: SalesChannel.HOME.toString(),
                cart: [],
                promoCodes: ['promo1', 'promo2'],
                payment: {
                    type: PaymentType.TRANSFER.toString(),
                    debtor: PaymentDebtor.LBC.toString(),
                    status: PaymentStatus.PENDING.toString()
                },
                delivery: {
                    type: DeliveryType.SHIPMENT.toString(),
                    provider: DeliveryProvider.MONDIAL_RELAY.toString(),
                    trackingNumber: '2837328821',
                    status: DeliveryStatus.IN_TRANSIT.toString()
                }
            }

            await orderRepository.save(order)
            const result = await orderRepository.get(orderIds[0])

            expect(result).to.deep.equal(
                {
                    ...order,
                    ...{createdAt: currentDatetime, updatedAt: currentDatetime}
                })
        })
    })

    describe('#getAll', function () {
        it('doit retourner toutes les commandes', async () => {
            const orderA = {
                id: orderIds[0],
                clientId: null,
                status: OrderStatus.VALIDATED.toString(),
                salesChannel: SalesChannel.LBC.toString(),
                cart: cart,
                promoCodes: [],
                payment: {
                    type: PaymentType.TRANSFER.toString(),
                    debtor: PaymentDebtor.LBC.toString(),
                    status: PaymentStatus.PENDING.toString()
                },
                delivery: {
                    type: DeliveryType.SHIPMENT.toString(),
                    provider: DeliveryProvider.MONDIAL_RELAY.toString(),
                    trackingNumber: '2837328821',
                    status: DeliveryStatus.IN_TRANSIT.toString()
                }
            }

            const orderB = {
                id: orderIds[1],
                clientId: null,
                status: OrderStatus.COMPLETED.toString(),
                salesChannel: SalesChannel.LBC.toString(),
                cart: [],
                promoCodes: ['promo1', 'promo2'],
                payment: {
                    type: PaymentType.CASH.toString(),
                    debtor: PaymentDebtor.END_BUYER.toString(),
                    status: PaymentStatus.PAID.toString()
                },
                delivery: {
                    type: DeliveryType.COLLECT.toString(),
                    provider: DeliveryProvider.NOT_APPLICABLE.toString(),
                    trackingNumber: null,
                    status: DeliveryStatus.DELIVERED.toString()
                }
            }

            await orderRepository.save(orderA)
            await orderRepository.save(orderB)
            const result = await orderRepository.getAll()

            expect(result).to.deep.equal([
                {
                    ...orderA,
                    ...{
                        createdAt: currentDatetime,
                        updatedAt: currentDatetime
                    }
                },
                {
                    ...orderB,
                    ...{
                        createdAt: currentDatetime,
                        updatedAt: currentDatetime
                    }
                }
            ])
        })
    })

    describe('#update', function () {
        it('doit mettre à jour une commande et son panier', async () => {
            const expectedOrder = {
                id: orderIds[0],
                clientId: null,
                status: OrderStatus.VALIDATED.toString(),
                salesChannel: SalesChannel.LBC.toString(),
                cart: cart,
                promoCodes: [],
                payment: {
                    type: PaymentType.CASH.toString(),
                    debtor: PaymentDebtor.END_BUYER.toString(),
                    status: PaymentStatus.PAID.toString()
                },
                delivery: {
                    type: DeliveryType.COLLECT.toString(),
                    provider: null,
                    trackingNumber: null,
                    status: DeliveryStatus.DELIVERED.toString()
                }
            }

            await orderRepository.save({
                id: orderIds[0],
                clientId: null,
                status: OrderStatus.INITIALIZED.toString(),
                salesChannel: SalesChannel.HOME.toString(),
                cart: cart,
                promoCodes: [],
                payment: {
                    type: PaymentType.TRANSFER.toString(),
                    debtor: PaymentDebtor.LBC.toString(),
                    status: PaymentStatus.PENDING.toString()
                },
                delivery: {
                    type: DeliveryType.SHIPMENT.toString(),
                    provider: DeliveryProvider.MONDIAL_RELAY.toString(),
                    trackingNumber: '2837328821',
                    status: DeliveryStatus.IN_TRANSIT.toString()
                }
            })

            await orderRepository.update(expectedOrder)
            const requestedOrder = await orderRepository.get(orderIds[0])

            expect(requestedOrder).to.deep.equal({
                ...expectedOrder,
                ...{createdAt: currentDatetime, updatedAt: currentDatetime}
            })
        })

        it('doit mettre à jour une commande sans panier', async () => {
            const expectedOrder = {
                id: orderIds[0],
                clientId: null,
                status: OrderStatus.VALIDATED.toString(),
                salesChannel: SalesChannel.LBC.toString(),
                cart: [],
                promoCodes: [],
                payment: {
                    type: PaymentType.CASH.toString(),
                    debtor: PaymentDebtor.END_BUYER.toString(),
                    status: PaymentStatus.PAID.toString()
                },
                delivery: {
                    type: DeliveryType.COLLECT.toString(),
                    provider: null,
                    trackingNumber: null,
                    status: DeliveryStatus.DELIVERED.toString()
                }
            }

            await orderRepository.save({
                id: orderIds[0],
                clientId: null,
                status: OrderStatus.INITIALIZED.toString(),
                salesChannel: SalesChannel.HOME.toString(),
                cart: cart,
                promoCodes: [],
                payment: {
                    type: PaymentType.TRANSFER.toString(),
                    debtor: PaymentDebtor.LBC.toString(),
                    status: PaymentStatus.PENDING.toString()
                },
                delivery: {
                    type: DeliveryType.SHIPMENT.toString(),
                    provider: DeliveryProvider.MONDIAL_RELAY.toString(),
                    trackingNumber: '2837328821',
                    status: DeliveryStatus.IN_TRANSIT.toString()
                }
            })

            await orderRepository.update(expectedOrder)
            const requestedOrder = await orderRepository.get(orderIds[0])

            expect(requestedOrder).to.deep.equal({
                ...expectedOrder,
                ...{createdAt: currentDatetime, updatedAt: currentDatetime}
            })
        })
    })
})