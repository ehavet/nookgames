export function getCandiesUsecaseFactory (candyRepository) {
    return async () => {
        return await candyRepository.get()
    }
}