const enumValue = (name) => Object.freeze({toString: () => name})

export const PaymentStatus = Object.freeze({
    PENDING: enumValue('pending'),
    PAID:  enumValue('paid')
})