import {expect, database} from './toolbox'
import {PromoRepository} from "../src/ihm/infrastructure/promo.repository";

describe('PromoRepository', function () {
    let promoRepository
    const expectedPromoList = [
        {id: 'promo1', type: 'discount', value: 1000},
        {id: 'promo2', type: 'free', value: 0}
    ]
    const currentDatetime = new Date('2021-06-23 18:30:17.000000')

    before(async () => {
        promoRepository = new PromoRepository(database)
    })

    beforeEach(async () => {
        for (const promo of expectedPromoList) {
            await database.result(
                'INSERT INTO promo (id, type, value, created_at, updated_at) VALUES (${id}, ${type}, ${value}, ${created_at}, ${updated_at})',
                { ...promo, ...{ created_at: currentDatetime , updated_at: currentDatetime} }
            )
        }
    })

    afterEach(async () => {
        const idList = expectedPromoList.map(promo => promo.id)
        await database.result(
            'DELETE FROM promo WHERE id in ($1:csv)', [idList], a => a.rowCount
        )
    })

    describe('#getAll', function () {
        it('doit retourner toutes les promotions', async function () {
            const result = await promoRepository.getAll()
            expect(result).to.deep.equal(expectedPromoList)
        })
    })
})