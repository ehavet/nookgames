export class Dashboard {
    #withdrawalRepository
    #lotRepository
    #promoRepository
    #priceDatasource
    #orderPromoDatasource

    constructor(withdrawalRepository, lotRepository, promoRepository, priceDatasource, orderPromoDatasource) {
        this.#withdrawalRepository = withdrawalRepository
        this.#lotRepository = lotRepository
        this.#promoRepository = promoRepository
        this.#priceDatasource = priceDatasource
        this.#orderPromoDatasource = orderPromoDatasource
    }

    async sales() {
        const withdrawals = await this.#withdrawalRepository.getAll()
        const lots = await this.#lotRepository.getAll()
        const prices = await this.#priceDatasource.getAll()
        const pricesByItemId = groupPricesByItemId(prices)
        const promoList = await this.#promoRepository.getAll()
        const orderPromoList = await this.#orderPromoDatasource.getAll()
        return withdrawals.map((withdrawal) => {
            const lot = lots.find(lot => lot.id === withdrawal.lotId)
            const promoIds = orderPromoList.filter(promo => promo.orderId === withdrawal.orderId)
                .map(promo => promo.promoId)
            const applicablePromos = promoList.filter(promo => promoIds.includes(promo.id))
            const numberOfOrderItem = withdrawals.filter(el => el.orderId === withdrawal.orderId).length
            const priceListForItem = pricesByItemId[lot.itemId]
            console.log(`#promoIds => ${promoIds}`)
            console.log(`#orderId => ${withdrawal.orderId}`)
            console.log(`#numberOfItem => ${numberOfOrderItem}`)
            console.log(`#promoList => ${JSON.stringify(promoList)}`)
            console.log(`#promos => ${JSON.stringify(applicablePromos)}`)
            const displayedPrice = calculateItemSellingPrice(lot.itemId, withdrawal.createdAt, priceListForItem)
            return {
                orderId: withdrawal.orderId,
                itemId: lot.itemId,
                lotId: withdrawal.lotId,
                purchasePrice: lot.unitPrice,
                displayedPrice: displayedPrice,
                sellingPrice: applyPromoCode(displayedPrice, numberOfOrderItem, applicablePromos),
                createdAt: withdrawal.createdAt
            }
        })
    }
}

const groupPricesByItemId = (priceArray) => {
    return priceArray.reduce((acc, price) => {
        console.log(Object.keys(acc))
        if (Object.keys(acc).includes(price.itemId)) {
            acc[price.itemId].push(price)
            return acc
        } else {
            acc[price.itemId] = [price]
            return acc
        }
    }, {})
}

const applyPromoCode = (
    displayedPrice,
    numberOfOrderItem,
    promos
) => {
    if (promos.length <= 0) {return displayedPrice}
    const promo = promos[0]
    switch (promo.type) {
        case 'discount_per_item':
            return displayedPrice - promo.value
        case 'discount_on_invoice':
            return displayedPrice - (promo.value / numberOfOrderItem)
        default:
            return displayedPrice
    }
}

const calculateItemSellingPrice = (
    itemId,
    purchaseDate,
    priceListForItem
) => {
    const price = getItemPriceForPurchaseDate(priceListForItem, purchaseDate)
    return price.amount
}

const getItemPriceForPurchaseDate = (priceListForItem, purchaseDate) => {
    const pricesOrdered = orderPricesByMostRecent(priceListForItem)
    return pricesOrdered.find((price) => {
            return purchaseDate > price.createdAt
        }
    )
}

const orderPricesByMostRecent = (priceArray) => {
    return priceArray
        .sort((currentPrice, nextPrice) => currentPrice.createdAt - nextPrice.createdAt)
        .reverse()
}
