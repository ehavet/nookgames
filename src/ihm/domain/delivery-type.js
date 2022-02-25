const enumValue = (name) => Object.freeze({toString: () => name})

export const DeliveryType = Object.freeze({
    COLLECT: enumValue('collect'),
    SHIPMENT:  enumValue('shipment')
})