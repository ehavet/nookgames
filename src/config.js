import pkg from 'envie'
import dotenv from 'dotenv'
const { Envie, Joi } = pkg

dotenv.config()

export default Envie({
    APP_NAME: Joi.string(),
    APP_PORT: Joi.number().min(0).default(8080).description('Port on which the HTTP server will listen'),
})