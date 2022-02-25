const enumValue = (name) => Object.freeze({toString: () => name})

export const AcquisitionChannel = Object.freeze({
    HOME: enumValue('home'),
    LBC:  enumValue('lbc'),
    VINTED:  enumValue('vinted')
})