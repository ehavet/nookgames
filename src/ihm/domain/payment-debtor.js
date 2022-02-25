const enumValue = (name) => Object.freeze({toString: () => name})

export const PaymentDebtor = Object.freeze({
    LBC: enumValue('lbc'),
    STRIPE:  enumValue('stripe'),
    END_BUYER:  enumValue('endBuyer')
})