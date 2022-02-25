import {param, body, validationResult} from 'express-validator'
import {OrderStatus} from "../domain/order-status";
import {SalesChannel} from "../domain/sales-channel";
import {PaymentType} from "../domain/payment-type";
import {PaymentDebtor} from "../domain/payment-debtor";
import {PaymentStatus} from "../domain/payment-status";
import {DeliveryType} from "../domain/delivery-type";
import {DeliveryStatus} from "../domain/delivery-status";

export default function (router, container) {
    router.use(async function (
        req,
        res,
        next
    ) {
        console.log('Time: %d', Date.now())
        next()
    })

    router.post('/v0/orders/',
        body('id').trim().optional(),
        body('client_id').trim().optional(),
        body('status').trim()
            .notEmpty().withMessage('status property must be provided')
            .isIn(['initialized', 'canceled', 'validated', 'completed']).withMessage('status value can be only initialized, canceled, validated or completed'),
        body('sales_channel').trim()
            .notEmpty().withMessage('sales_channel property must be provided')
            .isIn(['home', 'lbc', 'vinted']).withMessage('sales_channel value can be only home, lbc or vinted'),
        body('cart')
            .isArray({min: 0}).withMessage('cart value must be provided and must be an array'),
        body('promo_codes')
            .isArray({min: 0}).withMessage('promo_codes must be an array'),
        body('payment').notEmpty().withMessage('payment resource must be provided'),
        body('payment.type').trim()
            .notEmpty().withMessage('payment type property must be provided')
            .isIn(['cash', 'transfer']).withMessage('payment type value can be only cash or transfer'),
        body('payment.debtor').trim()
            .notEmpty().withMessage('payment debtor property must be provided')
            .isIn(['lbc', 'stripe', 'end_buyer']).withMessage('payment debtor value can be only lbc, stripe or end_buyer'),
        body('payment.status').trim()
            .notEmpty().withMessage('payment status property must be provided')
            .isIn(['pending', 'paid']).withMessage('payment status value can be only pending or paid'),
        body('delivery').notEmpty().withMessage('delivery resource must be provided'),
        body('delivery.type').trim()
            .notEmpty().withMessage('delivery type property must be provided')
            .isIn(['collect', 'shipment']).withMessage('delivery type value can be only collect or shipment'),
        body('delivery.provider').trim().optional()
            .isIn(['mondial_relay', 'la_poste']).withMessage('delivery provider value can be only mondial_relay or la_poste'),
        body('delivery.tracking_number').trim().optional()
            .isString().withMessage('delivery tracking_number value can be only a string'),
        body('delivery.status').trim()
            .notEmpty().withMessage('delivery status property must be provided')
            .isIn(['preparing', 'in_transit', 'delayed', 'delivered']).withMessage('delivery status value can be only preparing, in_transit, delayed or delivered'),
        async function (req, res) {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                const messages = errors.array().map(element => element.msg)
                return res.boom.badData(messages)
            }

            const body = req.body

            try {
                res.status(201).send(await container.CreateOrder({
                    id: body.id,
                    clientId: body.client_id,
                    status: OrderStatus[body.status.toUpperCase()],
                    salesChannel: SalesChannel[body.sales_channel.toUpperCase()],
                    cart: body.cart,
                    promoCodes: body.promo_codes,
                    payment: {
                        type: PaymentType[body.payment.type.toUpperCase()],
                        debtor: PaymentDebtor[body.payment.debtor.toUpperCase()],
                        status: PaymentStatus[body.payment.status.toUpperCase()]
                    },
                    delivery: {
                        type: DeliveryType[body.delivery.type.toUpperCase()],
                        provider: body.provider,
                        trackingNumber: body.tracking_number,
                        status: DeliveryStatus[body.delivery.status.toUpperCase()]
                    }
                }))
            } catch (error) {
                res.boom.internal(error)
            }
        })

    router.post('/v0/clients/',
        body('id').trim().optional(),
        body('name').trim().notEmpty().isString().withMessage('name property must be provided'),
        body('email').trim().optional().isEmail(),
        body('phone_number').trim().optional(),
        body('acquisition_channel').trim()
            .notEmpty().withMessage('acquisition_channel property must be provided')
            .isIn(['home', 'lbc', 'vinted']).withMessage('acquisition_channel value can be only home, lbc or vinted'),
        body('address').notEmpty().withMessage('address resource must be provided'),
        body('address.street').trim().notEmpty().withMessage('address street property must be provided'),
        body('address.city').trim().notEmpty().withMessage('address city property must be provided'),
        body('address.postal_code').trim().notEmpty().withMessage('address postal_code property must be provided'),
        async function (req, res) {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                const messages = errors.array().map(element => element.msg)
                return res.boom.badData(messages)
            }

            const body = req.body

            try {
                res.status(201).send(await container.CreateClient({
                    id: body.id,
                    name: body.name,
                    email: body.email,
                    phoneNumber: body.phone_number,
                    acquisitionChannel: body.acquisition_channel,
                    address: {
                        street: body.address.street,
                        city: body.address.city,
                        postalCode: body.address.postal_code
                    }
                }))
            } catch (error) {
                res.boom.internal(error)
            }
        })

    return router
}

