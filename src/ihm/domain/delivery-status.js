const enumValue = (name) => Object.freeze({toString: () => name})

export const DeliveryStatus = Object.freeze({
    PREPARING: enumValue('preparing'),
    IN_TRANSIT: enumValue('in_transit'),
    DELAYED:  enumValue('delayed'),
    DELIVERED:  enumValue('delivered')
})