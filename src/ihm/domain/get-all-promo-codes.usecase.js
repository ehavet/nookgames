export function getAllPromoCodesUsecaseFactory (promoRepository) {
    return async () => {
        return await promoRepository.getAll()
    }
}