import express from 'express'
const app = express()
import boom from 'express-boom'
import config from './config'
import {candiesRoutes, ihmRoutes, apiRoutes} from './routes'
import logger from 'express-pino-logger'
import cors from 'cors'
import helmet from 'helmet'

function init() {
    app.set('views', './src/views')
    app.set('view engine', 'pug')
    app.use(express.static('./assets'));
    app.use(helmet())
    app.use(cors())
    app.use(logger())
    app.use(express.urlencoded({extended: true}))
    app.use(express.json())
    app.use(boom())
    app.use(candiesRoutes)
    app.use(ihmRoutes)
    app.use(apiRoutes)
    app.use(function (req, res) {
        res.boom.notFound(`Could not find resource ${req.path}`)
    });

    // const connexion = await database.connect()
    // connexion.done()
    // console.log(connexion.client.serverVersion)

    app.listen(config.get('APP_PORT'), () => {
        console.log(`Express server listening on http://localhost:${config.get('APP_PORT')}`)
    })
}

init()