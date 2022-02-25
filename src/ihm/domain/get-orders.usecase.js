export function getOrdersUsecaseFactory (orderRepository) {
    return async () => {
        return await orderRepository.getAll()
    }
}