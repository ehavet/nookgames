export function createCandyUsecaseFactory (candyRepository) {
    return async (name, sugarLevel, description) => {
        return await candyRepository.save(name, sugarLevel, description)
    }
}