import { param, body, validationResult } from 'express-validator'
import { CandyNotFoundError } from '../../domain/api.errors.js'
// import { getSoldItems } from '../../../ihm/domain/watch-lbc-sales.usecase.js'

export default function (router, container) {
    router.use(async function (
        req,
        res,
        next
    ) {
        console.log('Time: %d', Date.now())
        next()
    })

    router.get('/v0/candies',
        async function (
            req,
            res,
        ) {
            try {
                res.status(200).send(await container.GetCandies())
            } catch (error) {
                res.status(500).send({error: "erreur 500"})
            }
        })

    router.get('/v0/gmail-api-auth',
        async function (
            req,
            res,
        ) {
            try {
                const url = await container.GetGmailApiAuthUrl()
                res.redirect(url)
            } catch (error) {
                console.log(`AUTH ERROR ${error}`)
                res.status(500).send({error: "erreur 500"})
            }
        })

    router.get('/v0/gmail-api-token',
        async function (
            req,
            res,
        ) {
            const code = req.query.code
            const scope = req.query.scope
            try {
                await container.SetGmailApiTokenFromCode(code)
                res.redirect('http://localhost:8080/index')
            } catch (error) {
                 console.log(`TOKEN ERROR ${error}`)
                res.status(500).send({error: "erreur 500"})
            }
        })

    router.get('/v0/latest-lbc-sales',
        async function (
            req,
            res,
        ) {
            try {
                res.status(200).send({sold_items: await container.GetLatestLbcSales()})
            } catch (error) {
                console.log(error)
                res.status(500).send({error: "erreur 500"})
            }
        })

//    router.get('/v0/latest',
//        async function (
//            req,
//            res,
//        ) {
//            try {
//                res.status(200).send({sold_items: await getSoldItems()})
//            } catch (error) {
//                res.status(500).send({error: "erreur 500"})
//            }
//        })

    /**
     * @openapi
     * /v0/candies/{id}:
     *   get:
     *     summary: Retrieve a single JSONPlaceholder candy.
     *     description: Retrieve a candy by ID.
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         description: Numeric ID of the candy to retrieve.
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: success
     *         content:
     *              application/json:
     *                  schema:
     *                      properties:
     *                          id:
     *                              type: string
     *                              description: The candy ID
     *                              example: 3
     *                          name:
     *                              type: string
     *                              description: The candy's name
     *                              example: chocobon
     */
    router.get('/v0/candies/:id',
        param('id').trim().notEmpty().withMessage('candy\'s id must be provided'),
        async function (
            req,
            res,
        ) {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const messages = errors.array().map(element => element.msg)
                return res.boom.badData(messages)
            }
            try {
                res.status(200).send(await container.GetCandy(req.params.id))
            } catch (error) {
                switch (true) {
                    case error instanceof CandyNotFoundError:
                        return res.boom.notFound(error.message)
                    default:
                        res.boom.internal(error)
                }

            }
        })

    router.post('/v0/candies/',
        body('name')
            .trim().notEmpty().withMessage('name property must be provided'),
        body('sugar_level')
            .trim().notEmpty().withMessage('sugar_level property must be provided')
            .isIn(['high', 'down']).withMessage('sugar_level value can be only high or down'),
        body('description')
            .trim().notEmpty().withMessage('description property must be provided'),
        async function (req, res) {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                const messages = errors.array().map(element => element.msg)
                return res.boom.badData(messages)
            }

            try {
                res.status(201).send(await container.CreateCandy(req.body.name, req.body.sugar_level, req.body.description))
            } catch (error) {
                res.boom.internal(error)
            }
        })

    return router
}

