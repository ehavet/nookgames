import { expect, database, dateFaker } from './toolbox'
import dayjs from '../libs/daysjs'
import { ItemRepository } from '../src/ihm/infrastructure/item.repository'
import { LotRepository } from '../src/ihm/infrastructure/lot.repository'
import { OrderRepository } from '../src/ihm/infrastructure/order.repository'
import { WithdrawalRepository } from '../src/ihm/infrastructure/withdrawal.repository'
import { OrderStatus } from '../src/ihm/domain/order-status'
import { SalesChannel } from '../src/ihm/domain/sales-channel'
import { PaymentType } from '../src/ihm/domain/payment-type'
import { PaymentDebtor } from '../src/ihm/domain/payment-debtor'
import { PaymentStatus } from '../src/ihm/domain/payment-status'
import { DeliveryType } from '../src/ihm/domain/delivery-type'
import { DeliveryProvider } from '../src/ihm/domain/delivery-provider'
import { DeliveryStatus } from '../src/ihm/domain/delivery-status'

describe('WithdrawalRepository', function () {
    let itemRepository
    let lotRepository
    let orderRepository
    let withdrawalRepository
    let lot
    const orderId = 'ab75a407-e1c9-4e85-b4ec-49ab48e5d11e'
    const cart = ['mk8dlxeC17', 'pakpak']
    const currentDatetime = new Date('2021-08-23 18:30:17.000000')

    const cleanDatabase = async () => {
        await database.result(
            'DELETE FROM lot WHERE item_id IN ($1:csv)', [cart], a => a.rowCount
        )
        await database.result(
            'DELETE FROM item_order WHERE order_id = $1', orderId, a => a.rowCount
        )
        await database.result(
            'DELETE FROM price WHERE item_id IN ($1:csv)', [cart], a => a.rowCount
        )
        await database.result(
            'DELETE FROM item WHERE id IN ($1:csv)', [cart], a => a.rowCount
        )
        await database.result(
            'DELETE FROM delivery WHERE order_id = $1', orderId, a => a.rowCount
        )
        await database.result(
            'DELETE FROM payment WHERE order_id = $1', orderId, a => a.rowCount
        )
        await database.result(
            'DELETE FROM "order" WHERE id = $1', orderId, a => a.rowCount
        )
    }

    before(async () => {
        itemRepository = new ItemRepository(database)
        lotRepository = new LotRepository(database)
        orderRepository = new OrderRepository(database)
        withdrawalRepository = new WithdrawalRepository(database)
    })

    beforeEach(async () => {
        await cleanDatabase()
        dateFaker.setCurrentDate(currentDatetime)
        await itemRepository.create({
            id: cart[0],
            title: 'mario kart 8 deluxe',
            pegi: 3,
            releaseDate: dayjs('2017-04-27'),
            editor: 'nintendo',
            platform: 'nintendo switch',
            price: 3090
        })
        await itemRepository.create({
            id: cart[1],
            title: 'ultra pakpak 3',
            pegi: 16,
            releaseDate: dayjs('2017-08-05'),
            editor: 'nintendo',
            platform: 'nintendo switch',
            price: 3590
        })
        lot = await lotRepository.create({
            itemId: cart[0],
            unitPrice: 1050,
            quantity: 32
        })
        await orderRepository.save({
            id: orderId,
            clientId: null,
            status: OrderStatus.INITIALIZED.toString(),
            salesChannel: SalesChannel.HOME.toString(),
            cart: cart,
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
    })

    afterEach(async () => {
        await database.result(
            'DELETE FROM withdrawal WHERE lot_id = $1', lot.id, a => a.rowCount
        )
        await cleanDatabase()
    })

    describe('#create', function () {
        it('doit enregistrer un retrait en base de donnée et retourner le l\objet correspondant', async function () {
            const expectedWithdrawal = await withdrawalRepository.create({
                lotId: lot.id,
                orderId: orderId
            })
            const persistedWithdrawal = await database.one('SELECT withdrawal.id, withdrawal.lot_id, withdrawal.order_id, withdrawal.created_at, withdrawal.updated_at FROM withdrawal WHERE withdrawal.id = $1', expectedWithdrawal.id)
            expect(expectedWithdrawal).to.deep.equal({
                    id: persistedWithdrawal.id,
                    lotId: persistedWithdrawal.lot_id,
                    orderId: persistedWithdrawal.order_id,
                    createdAt: persistedWithdrawal.created_at,
                    updatedAt: persistedWithdrawal.updated_at
                }
            )
        })
    })

    describe('#get', function () {
        it('doit retourner un retrait par son identifiant', async function () {
            const expectedWithdrawal = await withdrawalRepository.create({
                lotId: lot.id,
                orderId: orderId
            })
            const retrievedWithdrawal = await withdrawalRepository.get(expectedWithdrawal.id)
            expect(expectedWithdrawal).to.deep.equal(retrievedWithdrawal)
        })
    })

    describe('#getAll', function () {
        it('doit retourner tous les retraits', async function () {
            const firstWithdrawal = await withdrawalRepository.create({
                lotId: lot.id,
                orderId: orderId
            })
            const secondWithdrawal = await withdrawalRepository.create({
                lotId: lot.id,
                orderId: orderId
            })
            const retrievedWithdrawals = await withdrawalRepository.getAll()
            expect([firstWithdrawal, secondWithdrawal]).to.deep.equal(retrievedWithdrawals)
        })
    })

    describe('#delete', function () {
        it('doit supprimer un retrait de la base de donnée', async function () {
            const persitedWithdrawal = await withdrawalRepository.create({
                lotId: lot.id,
                orderId: orderId
            })
            await withdrawalRepository.delete(persitedWithdrawal.id)
            const result = await database.oneOrNone(
                'SELECT * FROM withdrawal WHERE withdrawal.id = $1',
                persitedWithdrawal.id
            )
            expect(result).is.null
        })
    })
})