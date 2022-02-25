export function getAllItemsUsecaseFactory (itemRepository) {
    return async () => {
        return await itemRepository.getAll()
    }
}