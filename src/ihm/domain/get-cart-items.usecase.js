export function getCartItemsUsecaseFactory (itemRepository) {
    return async (itemIdsArray) => {
        return await itemRepository.getList(itemIdsArray)
    }
}