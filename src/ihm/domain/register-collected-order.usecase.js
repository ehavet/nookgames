import {OrderStatus} from './order-status'
import {SalesChannel} from './sales-channel'
import {PaymentType} from './payment-type'
import {PaymentDebtor} from './payment-debtor'
import {PaymentStatus} from './payment-status'
import {DeliveryType} from './delivery-type'
import {DeliveryStatus} from './delivery-status'
import {DeliveryProvider} from './delivery-provider'

export function registerCollectedOrderUsecaseFactory(orderRepository, withdrawalRepository, lotRepository) {
    return async (salesChannel, cart, promoCodes) => {
        if (!Array.isArray(cart) || cart.length === 0) {
            return
        }
        const order = {
            clientId: null,
            status: OrderStatus.COMPLETED.toString(),
            salesChannel: SalesChannel.LBC.toString(),
            cart: cart,
            promoCodes: promoCodes || null,
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
        try {
            const persistedOrder = await orderRepository.save(order)
            // choisir le lot du retrait
            const lotList = await lotRepository.getAllByItemList(cart)
            for (const lot of lotList) {
                await withdrawalRepository.create({orderId: persistedOrder.id, lotId: lot.id})
            }
        } catch (error) {
            console.log(error)
        }
    }
}