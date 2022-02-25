export function createClientUsecaseFactory(clientRepository) {
    return async (client) => {
        return await clientRepository.create({
            id: client.id,
            name: client.name,
            email: client.email,
            phoneNumber: client.phoneNumber,
            acquisitionChannel: client.acquisitionChannel,
            address: {
                street: client.address.street,
                city: client.address.city,
                postalCode: client.address.postalCode
            }
        })
    }
}