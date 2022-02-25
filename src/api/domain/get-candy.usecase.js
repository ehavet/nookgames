import { CandyNotFoundError } from './api.errors.js'

export function getCandyUsecaseFactory (candyRepository) {
    return async (candyId) => {
        const candy = await candyRepository.get(candyId)
        if (candy.length === 1) {
            return candy
        }
        throw new CandyNotFoundError(candyId)
    }
}