export function addItemLotUsecaseFactory (lotRepository) {
    return async (itemId, unitPrice ,quantity) => {
        return await lotRepository.create({
            itemId: itemId,
            unitPrice: unitPrice,
            quantity: quantity,
        })
    }
}