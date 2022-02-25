export function createOrderUsecaseFactory(orderRepository) {
    return async (order) => {
        return await orderRepository.save({
            id: order.id,
            clientId: order.clientId,
            status: order.status.toString(),
            salesChannel: order.salesChannel.toString(),
            cart: order.cart,
            promoCodes: order.promoCodes,
            payment: {
                type: order.payment.type.toString(),
                debtor: order.payment.debtor.toString(),
                status: order.payment.status.toString()
            },
            delivery: {
                type: order.delivery.type.toString(),
                provider: order.delivery.provider,
                trackingNumber: order.delivery.trackingNumber,
                status: order.delivery.status.toString()
            }
        })
    }
}