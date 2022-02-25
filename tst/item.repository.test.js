import {expect, database, dateFaker} from './toolbox'
import dayjs from '../libs/daysjs'
import {ItemRepository} from '../src/ihm/infrastructure/item.repository'
import {v4 as uuidv4} from 'uuid'

describe('ItemRepository', function () {
    let repository
    const itemIds = ['mk8dlxeC17', 'zelda']
    const currentDatetime = new Date('2021-06-23 18:30:17.000000')

    before(async () => {
        repository = new ItemRepository(database)
    })

    beforeEach(async () => {
        repository = new ItemRepository(database)
        dateFaker.setCurrentDate(currentDatetime)
    })

    afterEach(async () => {
        await database.result(
            'DELETE FROM price WHERE price.item_id IN ($1:csv)', [itemIds], a => a.rowCount
        )
        await database.result(
            'DELETE FROM item WHERE id IN ($1:csv)', [itemIds], a => a.rowCount
        )
    })

    describe('#create', function () {
        it('doit enregistrer un article et un prix en base de donnée', async function () {
            await repository.create({
                id: itemIds[0],
                title: 'mario kart 8 deluxe',
                pegi: 3,
                releaseDate: dayjs('2017-04-27'),
                editor: 'nintendo',
                platform: 'nintendo switch',
                price: 3590
            })

            const result = await database.result('SELECT item.id, item.title, item.pegi, item.created_at, item.updated_at, item.release_date, item.editor, item.platform, price.amount FROM item, price WHERE item.id = $1 AND price.item_id = $1 ORDER BY price.created_at DESC LIMIT 1', itemIds[0])
            expect(result.rows[0].id).to.equal(itemIds[0])
            expect(result.rows[0].title).to.equal('mario kart 8 deluxe')
            expect(result.rows[0].pegi).to.equal(3)
            expect(result.rows[0].created_at).to.deep.equal(currentDatetime)
            expect(result.rows[0].updated_at).to.deep.equal(currentDatetime)
            expect(result.rows[0].release_date).to.equal('2017-04-27')
            expect(result.rows[0].editor).to.equal('nintendo')
            expect(result.rows[0].platform).to.equal('nintendo switch')
            expect(result.rows[0].amount).to.equal(3590)
        })

    })

    describe('#get', function () {
        it('doit retourner l\'article demandé par son identifiant', async function () {
            await repository.create({
                id: itemIds[0],
                title: 'super tueur 2',
                pegi: 3,
                releaseDate: dayjs('2018-04-27'),
                editor: 'nintendo',
                platform: 'nintendo switch',
                price: 3590
            })

            const item = await repository.get(itemIds[0])
            expect(item).to.deep.equal({
                id: itemIds[0],
                title: 'super tueur 2',
                pegi: 3,
                releaseDate: '2018-04-27',
                editor: 'nintendo',
                platform: 'nintendo switch',
                price: 3590,
                createdAt: currentDatetime,
                updatedAt: currentDatetime
            })
        })

        it('doit retourner l\'article demandé avec son dernier prix', async function () {
            await repository.create({
                id: itemIds[0],
                title: 'super tueur 2',
                pegi: 3,
                releaseDate: dayjs('2018-04-27'),
                editor: 'nintendo',
                platform: 'nintendo switch',
                price: 3590
            })

            const laterDate = new Date('2021-08-01 23:30:44.000000')
            dateFaker.setCurrentDate(laterDate)

            await database.none(
                'INSERT INTO price(id, item_id, amount, created_at, updated_at)' +
                'VALUES(${id}, ${item_id}, ${amount}, ${created_at}, ${updated_at})',
                {
                    id: uuidv4(),
                    item_id: itemIds[0],
                    amount: 9999,
                    created_at: laterDate,
                    updated_at: laterDate
                }
            )

            const item = await repository.get(itemIds[0])
            expect(item).to.deep.equal({
                id: itemIds[0],
                title: 'super tueur 2',
                pegi: 3,
                releaseDate: '2018-04-27',
                editor: 'nintendo',
                platform: 'nintendo switch',
                price: 9999,
                createdAt: currentDatetime,
                updatedAt: currentDatetime
            })
        })
    })

    describe('#getList', function () {
        it('doit retourner les article demandés par leurs identifiants', async function () {
            await repository.create({
                id: itemIds[0],
                title: 'super tueur 2',
                pegi: 3,
                releaseDate: dayjs('2018-04-27'),
                editor: 'nintendo',
                platform: 'nintendo switch',
                price: 3590
            })

            await repository.create({
                id: itemIds[1],
                title: 'super zelda 56',
                pegi: 3,
                releaseDate: dayjs('2018-01-27'),
                editor: 'nintendo',
                platform: 'nintendo switch',
                price: 9999
            })

            const item = await repository.getList(itemIds)
            expect(item).to.deep.equal([
                {
                    id: itemIds[0],
                    title: 'super tueur 2',
                    pegi: 3,
                    releaseDate: '2018-04-27',
                    editor: 'nintendo',
                    platform: 'nintendo switch',
                    price: 3590,
                    createdAt: currentDatetime,
                    updatedAt: currentDatetime
                },
                {
                    id: itemIds[1],
                    title: 'super zelda 56',
                    pegi: 3,
                    releaseDate: '2018-01-27',
                    editor: 'nintendo',
                    platform: 'nintendo switch',
                    price: 9999,
                    createdAt: currentDatetime,
                    updatedAt: currentDatetime
                }
            ])
        })
    })

    describe('#update', function () {
        it('doit mettre à jour le prix et la date de dernière mise à jour d\'un article', async function () {
            await repository.create({
                id: itemIds[0],
                title: 'super mario kart 3',
                pegi: 3,
                releaseDate: dayjs('2018-04-27'),
                editor: 'nintendo',
                platform: 'nintendo switch',
                price: 3590
            })

            const laterDate = new Date('2021-08-01 23:30:44.000000')
            dateFaker.setCurrentDate(laterDate)

            await repository.update({
                id: itemIds[0],
                price: 9999
            })

            const item = await repository.get(itemIds[0])
            expect(item).to.deep.equal({
                id: itemIds[0],
                title: 'super mario kart 3',
                pegi: 3,
                releaseDate: '2018-04-27',
                editor: 'nintendo',
                platform: 'nintendo switch',
                price: 9999,
                createdAt: currentDatetime,
                updatedAt: laterDate
            })
        })
    })
})