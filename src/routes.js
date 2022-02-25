import express from 'express'
const router = express.Router()
import container from './container.js'
import candiesApiEndpoints from './api/controller/v0/candies.api.js'
import ihmEndpoints from './ihm/controller/ihm.js'
import apiEndpoints from './ihm/controller/api.js'

export const candiesRoutes = candiesApiEndpoints(router, container)
export const ihmRoutes = ihmEndpoints(router, container)
export const apiRoutes = apiEndpoints(router, container)