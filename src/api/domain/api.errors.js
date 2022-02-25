export class CandyNotFoundError extends Error {
    constructor (candyId) {
        const message = `Could not find candy with id : ${candyId}`
        super(message)
        this.name = 'CandyNotFoundError'
    }
}

export class GmailApiTokenNotFoundError extends Error {
    constructor (candyId) {
        const message = 'Could not find Gmail API token'
        super(message)
        this.name = 'GmailApiTokenNotFoundError'
    }
}