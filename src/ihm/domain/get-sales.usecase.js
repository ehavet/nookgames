import { Dashboard } from './dashboard.js'

export function getSalesUsecaseFactory (
    withdrawalRepository,
    lotRepository,
    promoRepository,
    priceDatasource,
    orderPromoDatasource
) {
    return async () => {
        const dashboard = new Dashboard(
            withdrawalRepository,
            lotRepository,
            promoRepository,
            priceDatasource,
            orderPromoDatasource
        )
        return await dashboard.sales()
    }
}