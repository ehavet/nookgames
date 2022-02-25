import {expect, database, dateFaker} from './toolbox'
import dayjs from '../libs/daysjs'
import { ItemRepository } from '../src/ihm/infrastructure/item.repository'
import { LotRepository } from '../src/ihm/infrastructure/lot.repository'

describe('LotRepository', function () {
    let itemRepository
    let lotRepository
    const itemId = 'mk8dlxeC21'
    const currentDatetime = new Date('2021-08-23 18:30:17.000000')

    before(async () => {
        itemRepository = new ItemRepository(database)
        lotRepository = new LotRepository(database)
    })

    beforeEach(async () => {
        dateFaker.setCurrentDate(currentDatetime)
        await itemRepository.create({
            id: itemId,
            title: 'mario kart 45 special edition',
            pegi: 12,
            releaseDate: dayjs('2017-04-27'),
            editor: 'nintendo',
            platform: 'nintendo switch',
            price: 9999
        })
    })

    afterEach(async () => {
        await database.result(
            'DELETE FROM lot WHERE item_id = $1', itemId, a => a.rowCount
        )
        await database.result(
            'DELETE FROM price WHERE price.item_id = $1', itemId, a => a.rowCount
        )
        await database.result(
            'DELETE FROM item WHERE id = $1', itemId, a => a.rowCount
        )
    })

    describe('#create', function () {
        it('doit enregistrer un lot en base de donnée et retourner le l\objet correspondant', async function () {
            const returnedLot = await lotRepository.create({
                itemId: itemId,
                unitPrice: 1000,
                quantity: 32
            })
            const retrievedLot = await database.one('SELECT lot.id, lot.item_id, lot.unit_price, lot.quantity, lot.created_at, lot.updated_at FROM lot WHERE lot.item_id = $1', itemId)
            expect(returnedLot).to.deep.equal({
                    id: retrievedLot.id,
                    itemId: retrievedLot.item_id,
                    unitPrice: retrievedLot.unit_price,
                    quantity: retrievedLot.quantity,
                    createdAt: retrievedLot.created_at,
                    updatedAt: retrievedLot.updated_at
                }
            )
        })
    })

    describe('#get', function () {
        it('doit retourner le lot par son identifiant', async function () {
            const expectedLot = await lotRepository.create({
                itemId: itemId,
                unitPrice: 1000,
                quantity: 32
            })
            const result = await lotRepository.get(expectedLot.id)
            expect(result).to.deep.equal(expectedLot)
        })
    })

    describe('#getAllByItemList', function () {
        it('doit retourner tous les lots courant pour une liste d\'articles', async function () {
            const firstLot = await lotRepository.create({
                itemId: itemId,
                unitPrice: 1000,
                quantity: 32
            })
            const secondLot = await lotRepository.create({
                itemId: itemId,
                unitPrice: 1250,
                quantity: 76
            })
            const result = await lotRepository.getAllByItemList([itemId])
            expect(result).to.deep.equal([firstLot, secondLot])
        })
    })

    describe('#getAll', function () {
        it('doit retourner tous les lots', async function () {
            const firstLot = await lotRepository.create({
                itemId: itemId,
                unitPrice: 1000,
                quantity: 32
            })
            const secondLot = await lotRepository.create({
                itemId: itemId,
                unitPrice: 1250,
                quantity: 76
            })
            const result = await lotRepository.getAll()
            expect(result).to.deep.equal([firstLot, secondLot])
        })
    })

    describe('#delete', function () {
        it('doit supprimer un lot de la base de donnée', async function () {
            const persistedLot = await lotRepository.create({
                itemId: itemId,
                unitPrice: 1000,
                quantity: 32
            })
            await lotRepository.delete(persistedLot.id)
            const result = await database.oneOrNone(
                'SELECT * FROM lot WHERE lot.item_id = $1',
                itemId
            )
            expect(result).is.null
        })
    })

    describe('#update', function () {
        it('doit mettre à jour un lot', async function () {
            const laterDate = new Date('2021-09-01 17:27:56.000000')
            dateFaker.setCurrentDate(laterDate)

            const createdLot = await lotRepository.create({
                itemId: itemId,
                unitPrice: 1000,
                quantity: 32
            })
            const expectedLot = {
                id: createdLot.id,
                itemId: itemId,
                unitPrice: 9999,
                quantity: 99,
                createdAt: laterDate,
                updatedAt: laterDate,
            }
            const updatedLot = await lotRepository.update(expectedLot)
            expect(updatedLot).to.deep.equal(expectedLot)
        })
    })
})