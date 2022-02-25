const enumValue = (name) => Object.freeze({toString: () => name})

export const OrderStatus = Object.freeze({
    INITIALIZED: enumValue('initialized'),
    CANCELED: enumValue('canceled'),
    VALIDATED:  enumValue('validated'),
    COMPLETED:  enumValue('completed')
})