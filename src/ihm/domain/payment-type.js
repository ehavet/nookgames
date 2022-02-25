const enumValue = (name) => Object.freeze({toString: () => name})

export const PaymentType = Object.freeze({
    CASH: enumValue('cash'),
    TRANSFER:  enumValue('transfer')
})