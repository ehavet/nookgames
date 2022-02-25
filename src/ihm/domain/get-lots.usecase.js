export function getLotsUsecaseFactory (lotRepository) {
    return async () => {
        return await lotRepository.getAll()
    }
}