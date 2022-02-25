const enumValue = (name) => Object.freeze({toString: () => name})

export const DeliveryProvider = Object.freeze({
    MONDIAL_RELAY: enumValue('mondial_relay'),
    LA_POSTE:  enumValue('la_poste'),
    NOT_APPLICABLE:  enumValue('not_applicable')
})